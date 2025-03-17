import {FC, useEffect, Component, forwardRef, useImperativeHandle, useCallback, useRef} from 'react';
import dynamic from 'next/dynamic';
import {useUser} from '@clerk/nextjs';
import {useSmartUpdate} from '@/hooks/useSmartUpdate';
import {DocumentContent} from '@/types/book';
import {formatEditorContent, calculatePosition, createDocumentContent} from '@/utils/documentUtils';

// 引入新样式
import './editor.css';

// 错误边界组件
class EditorErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean}> {
    constructor(props: {children: React.ReactNode}) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        console.error('[Editor] 错误边界捕获到错误:', error);
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[Editor] 组件错误:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="relative min-h-[200px] w-full max-w-screen-lg mx-auto">
                    <div className="relative min-h-[150px] flex items-center justify-center">
                        <span className="text-gray-400">编辑器加载失败，请刷新页面重试</span>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export interface EditorRef {
    focus: () => void;
}

type EditorProps = {
    content?: DocumentContent;
    onChange?: (content: DocumentContent) => void;
    bookId: string;
    version: number;
};

// 动态导入编辑器核心组件
const DynamicEditor = dynamic(
    () => import('./EditorCore').catch(err => {
        console.error('[Editor] 动态导入失败:', err);
        throw err;
    }),
    {
        ssr: false,
        loading: () => (
            <div className="relative min-h-[200px] w-full max-w-screen-lg mx-auto">
                <div className="relative min-h-[150px] flex items-center justify-center">
                    <span className="text-gray-400">编辑器加载中...</span>
                </div>
            </div>
        ),
    }
);

const Editor = forwardRef<EditorRef, EditorProps>((props, ref) => {
    const { user } = useUser();
    const userId = user?.id;

    if (!userId) {
        return (
            <div className="relative min-h-[200px] w-full max-w-screen-lg mx-auto">
                <div className="relative min-h-[150px] flex items-center justify-center">
                    <span className="text-gray-400">请先登录...</span>
                </div>
            </div>
        );
    }

    return (
        <EditorErrorBoundary>
            <DynamicEditor {...props} ref={ref} userId={userId} />
        </EditorErrorBoundary>
    );
});

Editor.displayName = 'Editor';

export default Editor;
