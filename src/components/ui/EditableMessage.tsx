import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const EditableMessage: React.FC<{
    content: string;
    onSave: (newContent: string) => Promise<void>;
    onCancel: () => void;
}> = ({ content, onSave, onCancel }) => {
    const [editedContent, setEditedContent] = useState(content);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
                editedContent.length,
                editedContent.length
            );
        }
    }, [editedContent]);

    const handleSave = async () => {
        if (editedContent.trim() === content || !editedContent.trim()) {
            onCancel();
            return;
        }
        
        setIsSaving(true);
        try {
            await onSave(editedContent);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="min-w-[500px] w-auto message-user rounded-3xl relative group"
        >
            <div className="pb-6">
                <textarea
                    ref={textareaRef}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full resize-none bg-transparent px-5 py-3
                             text-sm-md text-gray-900 dark:text-gray-100
                             focus:outline-none
                             scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                    style={{
                        minHeight: '2.5rem',
                    }}
                />
            </div>
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <motion.button
                    onClick={onCancel}
                    className="px-3.5 py-2 rounded-full text-sm
                             text-gray-500 hover:text-gray-700 
                             dark:text-gray-400 dark:hover:text-gray-200
                             hover:bg-gray-100/50 dark:hover:bg-gray-700/50
                             transition-colors duration-200"
                >
                    取消
                </motion.button>
                <motion.button
                    onClick={handleSave}
                    disabled={isSaving || editedContent.trim() === content || !editedContent.trim()}
                    className={`px-3.5 py-2 rounded-full text-sm
                              transition-colors duration-200
                              ${isSaving || editedContent.trim() === content || !editedContent.trim()
                                ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'}`}
                >
                    {isSaving ? (
                        <div className="flex items-center gap-1">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
                            />
                            <span>保存中</span>
                        </div>
                    ) : '确定'}
                </motion.button>
            </div>
        </div>
    );
};

export default EditableMessage; 