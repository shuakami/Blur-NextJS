import {FC, useEffect, forwardRef, useImperativeHandle} from 'react';
import {useEditor, EditorContent} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import {SlashCommands} from './extensions/SlashCommands';
import {CustomPlaceholder} from './extensions/CustomPlaceholder';
import BlockMenu from './components/BlockMenu';

// 引入新样式
import './editor.css';

// 导入自定义扩展
import CustomSelectExtension from './extensions/CustomSelectExtension';

export interface EditorRef {
    focus: () => void;
}

type EditorProps = {
    content?: string;
    onChange?: (content: string) => void;
};

const Editor = forwardRef<EditorRef, EditorProps>(({ content = '', onChange }, ref) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            TaskList,
            TaskItem,
            Link.configure({
                openOnClick: false,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
            Highlight,
            SlashCommands,
            CustomPlaceholder,
            CustomSelectExtension.configure({
                timeThreshold: 300,
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'tiptap focus:outline-none',
            },
        },
        onUpdate: ({editor}) => {
            const html = editor.getHTML();
            onChange?.(html);
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    useEffect(() => {
        return () => {
            if (editor) {
                editor.destroy();
            }
        };
    }, [editor]);

    useImperativeHandle(ref, () => ({
        focus: () => {
            editor?.commands.focus();
        }
    }));

    if (!editor?.isEditable) {
        return null;
    }

    return (
        <div className="relative min-h-[200px] w-full max-w-screen-lg mx-auto">
            <div className="relative">
                <EditorContent
                    editor={editor}
                    className="min-h-[150px] outline-none"
                />
                {editor && <BlockMenu editor={editor}/>}
            </div>
        </div>
    );
});

Editor.displayName = 'Editor';

export default Editor;
