import React, { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EditButton from "@/components/ui/LLM/EditButton";
import EditableMessage from "@/components/ui/EditableMessage";
import { Message } from "@/types/stream";


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
    console.log("收到的消息:", message); // 打印收到的消
    return (
        <div className={`relative group ${isEditing ? 'w-full' : 'max-w-[70%]'} }`}>
            {!isEditing && message.status !== 'inactive' && (
                <div className="absolute right-full top-1 mr-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <EditButton onClick={onEdit} />
                </div>
            )}
            <AnimatePresence mode="wait" initial={false}>
                <motion.div 
                    key={isEditing ? "edit" : "view"}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 1 }}
                    transition={{ duration: 0 }}
                >
                    {isEditing ? (
                        <EditableMessage
                            content={message.content}
                            onSave={onSave}
                            onCancel={onCancel}
                        />
                    ) : (
                        <div className="message-user rounded-3xl">
                            <p className="px-5 py-3 text-sm-md">{message.content}</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
});

UserMessage.displayName = 'UserMessage';
export default UserMessage; 