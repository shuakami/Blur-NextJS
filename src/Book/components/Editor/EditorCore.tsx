/**
 * EditorCore - 富文本编辑器核心组件
 * 
 * Call Chain:
 * ```
 * BookEditor (UI Container)
 * ├── EditorCore (Core Editor)
 * │   ├── BlockMetadataExtension (Block Management)
 * │   ├── CustomSelectExtension (Selection)
 * │   ├── CustomBackspaceExtension (Backspace)
 * │   ├── DragHandleExtension (Drag & Drop)
 * │   ├── SlashCommands (Commands)
 * │   └── CustomPlaceholder (Placeholder)
 * │
 * ├── State Management
 * │   ├── useBookEditor (Editor State)
 * │   │   ├── MessageCenter (Message Queue)
 * │   │   └── VersionManager (Version Control)
 * │   │
 * │   ├── useBookSync (Server Sync)
 * │   │   └── BookContext (Book Data)
 * │   │
 * │   └── useWebSocketSync (Real-time Sync)
 * │       └── WebSocketContext (WS Connection)
 * │
 * └── UI Components
 *     ├── SaveStatus (Save State)
 *     ├── DynamicHeader (Header)
 *     └── DynamicContent (Content)
 * ```
 * 
 * Data Flow:
 * 1. User Input -> EditorCore
 * 2. EditorCore -> useBookEditor (State Update)
 * 3. useBookEditor -> MessageCenter (Message Queue)
 * 4. MessageCenter -> WebSocket (Real-time Sync)
 * 5. WebSocket -> VersionManager (Version Control)
 * 6. VersionManager -> EditorCore (Content Update)
 * 
 * @see {@link BlockMetadataExtension} 块级元数据处理
 * @see {@link useBookEditor} 编辑器状态管理
 * @see {@link MessageCenter} 消息处理中心
 * @see {@link VersionManager} 版本管理器
 * @see {@link WebSocketContext} WebSocket 连接管理
 */

import { FC, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DocumentContent } from '@/types/book';
import { createDocumentContent, formatEditorContent } from '@/utils/documentUtils';
import { BlockMetadataExtension } from './extensions/BlockMetadataExtension';
import CustomSelectExtension from './extensions/CustomSelectExtension';
import CustomBackspaceExtension from './extensions/CustomBackspaceExtension';
import { DragHandleExtension } from './extensions/DragHandleExtension';
import { SlashCommands } from './extensions/SlashCommands';
import { CustomPlaceholder } from './extensions/CustomPlaceholder';
import BlockMenu from './components/BlockMenu';


// 导入拖拽句柄样式
import './extensions/dragHandle.css';
import './components/BlockMenu.css';

/**
 * 编辑器引用接口
 * @public
 */
export interface EditorRef {
    /** 使编辑器获得焦点 */
    focus: () => void;
}

/**
 * 编辑器属性接口
 * @public
 */
type EditorCoreProps = {
    /** 文档内容 */
    content?: DocumentContent;
    /** 内容变更回调 */
    onChange?: (content: DocumentContent) => void;
    /** 文档ID */
    bookId: string;
    /** 文档版本 */
    version: number;
    /** 用户ID */
    userId: string;
};

const EditorCore = forwardRef<EditorRef, EditorCoreProps>(
    ({ content, onChange, version, userId, bookId }, ref) => {
        const forceUpdateRef = useRef<boolean>(false);
        const bookIdRef = useRef<string | null>(null);
        const versionRef = useRef<number>(0);
        const isLocalUpdateRef = useRef<boolean>(false);

        // 创建编辑器实例
        const editor = useEditor({
            extensions: [
                StarterKit,
                BlockMetadataExtension.configure({
                    onBlockCreated: (blockId, node) => {
                        try {
                            console.log('[BlockMetadata] 创建新块:', {
                                blockId,
                                type: node.type.name,
                                attrs: node.attrs,
                            });
                        } catch (err) {
                            console.error('[BlockMetadata] 创建块回调错误:', err);
                        }
                    },
                    onBlockUpdated: (blockId, node) => {
                        try {
                            console.log('[BlockMetadata] 更新块:', {
                                blockId,
                                type: node.type.name,
                                attrs: node.attrs,
                            });
                        } catch (err) {
                            console.error('[BlockMetadata] 更新块回调错误:', err);
                        }
                    },
                    autoAttributes: {
                        blockId: {
                            type: 'uuid',
                            onCopy: 'new',
                        },
                        createdAt: {
                            type: 'timestamp',
                            autoUpdateOnChange: false,
                        },
                        updatedAt: {
                            type: 'timestamp',
                            autoUpdateOnChange: true,
                        },
                        author: {
                            type: 'string',
                            default: userId,
                        },
                    },
                }),
                CustomSelectExtension.configure({
                    timeThreshold: 300,
                }),
                CustomBackspaceExtension,
                DragHandleExtension.configure({
                    dragHandleWidth: 22,
                }),
                SlashCommands,
                CustomPlaceholder,
            ],
            content: {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        attrs: {
                            blockId: crypto.randomUUID(),
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                            author: userId,
                        },
                    },
                ],
            },
            editorProps: {
                attributes: {
                    class: 'tiptap focus:outline-none',
                },
            },
            onCreate: ({ editor }) => {
                console.log('[Editor] 编辑器创建成功');
            },
            immediatelyRender: false,
        });

        useEffect(() => {
            if (bookId !== bookIdRef.current) {
                const logContext = {
                    oldBookId: bookIdRef.current,
                    newBookId: bookId,
                    oldVersion: versionRef.current,
                    newVersion: version,
                    action: 'book_switch'
                };
                console.log('[Editor] Book ID 发生变化，进行本地内容重置', logContext);

                if (editor) {
                    // 标记为本地更新，避免触发保存
                    isLocalUpdateRef.current = true;

                    // 清空编辑器内容
                    editor.commands.clearContent();

                    // 设置为初始段落（避免 editor.isEmpty 时光标问题）
                    editor.commands.setContent({
                        type: 'doc',
                        content: [
                            {
                                type: 'paragraph',
                                attrs: {
                                    blockId: crypto.randomUUID(),
                                    createdAt: Date.now(),
                                    updatedAt: Date.now(),
                                    author: userId,
                                },
                            },
                        ],
                    });

                    // 重置本地更新标记
                    isLocalUpdateRef.current = false;
                }

                // 标记强制刷新
                forceUpdateRef.current = true;
                bookIdRef.current = bookId;
            }
        }, [bookId, version, editor, userId]);

        useEffect(() => {
            if (!editor || !content?.blocks) {
                const logContext = {
                    hasEditor: !!editor,
                    hasContent: !!content,
                    hasBlocks: !!content?.blocks,
                    bookId,
                    version,
                    action: 'skip_update'
                };
                console.log('[Editor] 跳过更新：编辑器未就绪或无内容', logContext);
                return;
            }

            // 强制更新优先，忽略本地更新标记
            if (forceUpdateRef.current) {
                const logContext = {
                    version,
                    contentVersion: content.version,
                    blockCount: content.blocks.length,
                    action: 'sync_content',
                    source: 'force_update'
                };
                console.log('[Editor] 强制更新编辑器内容', logContext);

                editor.commands.clearContent();
                editor.commands.setContent(content.blocks as JSONContent);
                forceUpdateRef.current = false;
                versionRef.current = content.version ?? 0;
                return;
            }

            // 如果是本地更新，跳过外部内容同步
            if (isLocalUpdateRef.current) {
                isLocalUpdateRef.current = false;
                return;
            }

            const currentContent = editor.getJSON();
            if (JSON.stringify(currentContent) === JSON.stringify(content.blocks)) {
                const logContext = {
                    action: 'skip_update',
                    reason: 'content_identical'
                };
                console.log('[Editor] 跳过更新：编辑器内容与外部内容一致', logContext);
                return;
            }

            try {
                const logContext = {
                    version,
                    contentVersion: content.version,
                    blockCount: content.blocks.length,
                    action: 'sync_content',
                    source: 'remote'
                };
                console.log('[Editor] 从外部同步内容到编辑器', logContext);

                // [修改点] 总是更新内容,不再检查 isEmpty
                editor.commands.setContent(content.blocks as JSONContent);
                versionRef.current = content.version ?? 0;
            } catch (err) {
                const logContext = {
                    error: err,
                    action: 'sync_failed'
                };
                console.error('[Editor] 同步内容失败:', logContext);
            }
        }, [content, editor, bookId, version]);

        // 监听编辑器本地内容变化（用户输入）
        useEffect(() => {
            if (!editor) return undefined;

            const updateHandler = ({ transaction }: { transaction: any }) => {
                if (!transaction.docChanged || !content || forceUpdateRef.current) {
                    return;
                }

                try {
                    // 标记这是一个本地更新
                    isLocalUpdateRef.current = true;

                    // 提取本地编辑器内容
                    const blocks = formatEditorContent(editor.getJSON());
                    const newContent = createDocumentContent(blocks, versionRef.current, userId);
                    
                    // 直接触发更新，不干扰编辑器状态
                    onChange?.(newContent);
                } catch (err) {
                    console.error('[Editor] 更新内容失败:', err);
                    isLocalUpdateRef.current = false;
                }
            };

            editor.on('transaction', updateHandler);
            return () => {
                editor.off('transaction', updateHandler);
            };
        }, [editor, content, onChange, userId]);

        useImperativeHandle(ref, () => ({
            focus: () => {
                editor?.commands.focus();
            },
        }));

        if (!editor) {
            return (
                <div className="relative min-h-[200px] w-full max-w-screen-lg mx-auto">
                    <div className="relative min-h-[150px] flex items-center justify-center">
                        <span className="text-gray-400">加载中...</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative min-h-[200px] w-full max-w-screen-lg mx-auto">
                <div className="relative">
                    <EditorContent editor={editor} className="min-h-[150px] outline-none" />
                    {editor && <BlockMenu editor={editor} />}
                </div>
            </div>
        );
    }
);

EditorCore.displayName = 'EditorCore';

export default EditorCore;
