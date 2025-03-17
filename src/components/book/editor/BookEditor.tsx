import { FC, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Editor, { EditorRef } from '@/Book/components/Editor';
import { ChatBubbleLeftIcon, ClockIcon, StarIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { useLayout } from '@/components/layouts/LayoutContext';
import { cn } from '@/lib/utils/utils';
import { SharedChatLayout } from '@/components/layouts/SharedChatLayout';
import { 
    DynamicHeader, 
    DynamicContent, 
    DynamicButtonGroup, 
    DynamicTitleInput 
} from '@/components/layouts/DynamicLayout';
import { BOOK_CONSTANTS } from '@/constants/book';
import { HeaderButton } from './HeaderButton';
import { TopActionButton } from './TopActionButton';
import { SaveStatus } from './SaveStatus';
import { useBookEditor } from '@/hooks/useBookEditor';
import { useBookSync } from '@/hooks/useBookSync';
import { useBook } from '@/app/[笔记管理]/BookContext';
import { useWebSocketSync } from '@/hooks/useWebSocketSync';
import { MessageCenter } from '@/services/websocket/messageCenter';
import { VersionManager } from '@/services/version/versionManager';

export const BookEditor: FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const editorRef = useRef<EditorRef>(null);
    const { isSidebarOpen, toggleSidebar } = useLayout();
    const { isLoading, error, currentBook } = useBook();
    
    // 获取版本管理器和消息中心实例
    const versionManager = useMemo(() => VersionManager.getInstance(), []);
    const messageManager = useMemo(() => MessageCenter.getInstance(versionManager), [versionManager]);
    
    // 在顶层调用hooks
    const editor = useBookEditor(id as string, messageManager, versionManager);

    // 设置WebSocket同步
    useWebSocketSync({
        bookId: id as string,
        setState: editor.setState
    });

    // 设置笔记同步
    useBookSync({
        bookId: id as string,
        setState: editor.setState
    });

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            editorRef.current?.focus();
        }
    };

    if (isLoading) {
        return (
            <SharedChatLayout
                title="加载中..."
                description="文档编辑页面"
                showAvatar={true}
                renderMainContent={() => (
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="loading-spinner" />
                    </div>
                )}
                sidebarType="book"
                hideDefaultHeader={true}
            />
        );
    }

    if (error) {
        return (
            <SharedChatLayout
                title="错误"
                description="文档编辑页面"
                showAvatar={true}
                renderMainContent={() => (
                    <div className="flex justify-center items-center min-h-screen text-red-500">
                        加载失败: {error.message}
                    </div>
                )}
                sidebarType="book"
                hideDefaultHeader={true}
            />
        );
    }

    // 渲染主要内容
    const renderMainContent = () => (
        <div className="flex-grow flex flex-col h-screen">
            {/* 固定顶栏 */}
            <DynamicHeader isSidebarOpen={isSidebarOpen}>
                {/* 左侧面包屑 */}
                <div className="flex items-center text-sm h-full flex-grow-0 mr-2 min-w-0">
                    {/* 菜单按钮 */}
                    <button
                        className={cn(
                            'flex items-center justify-center w-6 h-6 mr-2 rounded hover:bg-gray-100',
                            'transition-all duration-300 ease-in-out overflow-hidden',
                            isSidebarOpen ? 'opacity-0 scale-0 w-0 mr-0' : 'opacity-100 scale-100'
                        )}
                        onClick={toggleSidebar}
                    >
                        <svg viewBox="0 0 14 14" className="w-4 h-4 text-gray-500">
                            <path d={BOOK_CONSTANTS.ICONS.MENU} fill="currentColor"/>
                        </svg>
                    </button>
                    {/* 标题按钮 */}
                    <button className="flex items-center flex-shrink-1 whitespace-nowrap h-6 rounded-md px-1.5 text-gray-800 hover:bg-gray-100">
                        <span className="truncate max-w-[240px]">
                            {editor.title || BOOK_CONSTANTS.UI.DEFAULT_TITLE}
                        </span>
                    </button>
                </div>

                {/* 右侧按钮组 */}
                <div className="flex items-center pl-2.5 justify-between h-11 text-sm">
                    <SaveStatus 
                        isSaving={editor.isSaving}
                        lastSaveError={editor.lastError}
                        timestamp={editor.lastSaveTime}
                        retryCount={editor.retryCount}
                        nextRetryTime={editor.nextRetryTime}
                    />
                    <HeaderButton className="px-2">分享</HeaderButton>
                    <HeaderButton icon={<ChatBubbleLeftIcon className="w-5 h-5 text-gray-800" />} />
                    <HeaderButton icon={<ClockIcon className="w-5 h-5 text-gray-800" />} />
                    <HeaderButton icon={<StarIcon className="w-5 h-5 text-gray-800" />} />
                    <HeaderButton icon={<EllipsisHorizontalIcon className="w-5 h-5 text-gray-800" />} />
                </div>
            </DynamicHeader>

            {/* 可滚动的内容区域 */}
            <div className="flex-grow overflow-auto">
                <DynamicContent isSidebarOpen={isSidebarOpen}>
                    {/* 标题区域和按钮组 */}
                    <div className="group">
                        {/* 顶部按钮组 */}
                        <DynamicButtonGroup>
                            <TopActionButton
                                icon={BOOK_CONSTANTS.ICONS.ADD_ICON}
                                label="添加图标"
                            />
                            <TopActionButton
                                icon={BOOK_CONSTANTS.ICONS.ADD_COVER}
                                label="添加封面"
                            />
                            <TopActionButton
                                icon={BOOK_CONSTANTS.ICONS.ADD_COMMENT}
                                label="添加评论"
                            />
                        </DynamicButtonGroup>

                        {/* 标题区域 */}
                        <div className="mb-4">
                            <DynamicTitleInput
                                value={editor.title}
                                onChange={editor.handleTitleChange}
                                onKeyDown={handleTitleKeyDown}
                                placeholder="无标题"
                            />
                        </div>
                    </div>

                    {/* 编辑器区域 */}
                    <div className="relative">
                        <div className="prose prose-lg max-w-none">
                            <Editor 
                                ref={editorRef} 
                                content={editor.content} 
                                onChange={editor.handleContentChange}
                                bookId={id as string}
                                version={currentBook?.version || 1}
                            />
                        </div>
                    </div>
                </DynamicContent>
            </div>
        </div>
    );

    return (
        <SharedChatLayout
            title={editor.title || BOOK_CONSTANTS.UI.DEFAULT_TITLE}
            description="文档编辑页面"
            showAvatar={true}
            renderMainContent={renderMainContent}
            sidebarType="book"
            hideDefaultHeader={true}
        />
    );
}; 