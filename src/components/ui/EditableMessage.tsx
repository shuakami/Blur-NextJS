import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import { motion } from "framer-motion";

// 按钮组件
const Button = memo(({ 
    onClick, 
    disabled, 
    variant = 'default',
    children 
}: {
    onClick: () => void;
    disabled?: boolean;
    variant?: 'default' | 'primary';
    children: React.ReactNode;
}) => (
    <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`px-3.5 py-2 rounded-full text-sm transition-colors duration-200
            ${variant === 'default' 
                ? 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                : disabled
                    ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white hover:bg-gray-400'
            }`}
    >
        {children}
    </motion.button>
));

Button.displayName = 'Button';

// 加载动画
const LoadingSpinner = memo(() => (
    <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
    />
));

LoadingSpinner.displayName = 'LoadingSpinner';

const EditableMessage = memo(({ 
    content, 
    onSave, 
    onCancel 
}: {
    content: string;
    onSave: (newContent: string) => Promise<void>;
    onCancel: () => void;
}) => {
    const [editedContent, setEditedContent] = useState(content);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 自动调整文本框高度
    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, []);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            adjustTextareaHeight();
            textarea.focus();
            textarea.setSelectionRange(editedContent.length, editedContent.length);
        }
    }, [editedContent, adjustTextareaHeight]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedContent(e.target.value);
    }, []);

    const handleSave = useCallback(async () => {
        if (editedContent.trim() === content || !editedContent.trim()) {
            onCancel();
            return;
        }
        
        setIsSaving(true);
        try {
            await onSave(editedContent.trim());
        } catch (error) {
            console.error('保存修改失败:', error);
        } finally {
            setIsSaving(false);
        }
    }, [editedContent, content, onSave, onCancel]);

    const isDisabled = isSaving || editedContent.trim() === content || !editedContent.trim();

    return (
        <div className="w-full message-user rounded-3xl relative group">
            <div className="pb-14">
                <textarea
                    ref={textareaRef}
                    value={editedContent}
                    onChange={handleChange}
                    className="w-full resize-none bg-transparent px-6 py-4
                             text-sm-md text-gray-900 dark:text-gray-100
                             focus:outline-none
                             scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                    style={{ minHeight: '2.5rem' }}
                />
            </div>
            <div className="absolute right-4 bottom-4 flex items-center gap-1.5">
                <Button onClick={onCancel}>
                    取消
                </Button>
                <Button 
                    onClick={handleSave}
                    disabled={isDisabled}
                    variant="primary"
                >
                    {isSaving ? (
                        <div className="flex items-center gap-1">
                            <LoadingSpinner />
                            <span>保存中</span>
                        </div>
                    ) : '确定'}
                </Button>
            </div>
        </div>
    );
});

EditableMessage.displayName = 'EditableMessage';

export default EditableMessage; 