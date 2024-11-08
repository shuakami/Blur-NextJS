import React, { memo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Message } from "@/types/stream";

// 懒加载组件
const EditButton = lazy(() => import("@/components/ui/LLM/EditButton"));
const EditableMessage = lazy(() => import("@/components/ui/EditableMessage"));

// 优化动画配置
const animationConfig = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
};

// 用户消息组件
const UserMessage = memo(({ 
    message, 
    isEditing, 
    onEdit, 
    onSave, 
    onCancel 
}: {
    message: Message;
    isEditing: boolean;
    onEdit: () => void;
    onSave: (content: string) => Promise<void>;
    onCancel: () => void;
}) => {

    return (
        <div className={`-mt-5 relative group ${isEditing ? 'w-full' : 'max-w-[70%]'}`}>
            {!isEditing && message.status !== 'inactive' && (
                <div className="absolute right-full top-1 mr-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Suspense fallback={null}>
                        <EditButton onClick={onEdit} />
                    </Suspense>
                </div>
            )}
            
            <motion.div 
                key={isEditing ? "edit" : "view"}
                {...animationConfig}
            >
                {isEditing ? (
                    <Suspense fallback={<div className="animate-pulse h-20 bg-gray-100 rounded-3xl"/>}>
                        <EditableMessage
                            content={message.content}
                            onSave={onSave}
                            onCancel={onCancel}
                        />
                    </Suspense>
                ) : (
                    <div className="message-user rounded-3xl">
                        <p className="px-5 py-3 text-sm-md">{message.content}</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
});

UserMessage.displayName = 'UserMessage';

export default UserMessage;