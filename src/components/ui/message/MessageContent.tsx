import React, { lazy, Suspense, memo } from 'react';
import { motion } from "framer-motion";
import { MessageContentProps } from './types';
import { animationConfig } from './types';

const EditableMessage = lazy(() => import("@/components/ui/EditableMessage"));

const MessageContent = memo(({ 
    message,
    isEditing,
    userId,
    conversationId,
    token,
    onSave,
    onCancel
}: MessageContentProps) => {
    return (
        <motion.div
            key={isEditing ? "edit" : "view"}
            {...animationConfig}
        >
            {isEditing && message.message_id && onSave && onCancel ? (
                <EditableMessage
                    content={message.content}
                    messageId={message.message_id}
                    userId={userId}
                    conversationId={conversationId}
                    token={token}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            ) : (
                <div className="message-user rounded-3xl">
                    <p className="px-5 py-3 text-sm-md">{message.content}</p>
                </div>
            )}
        </motion.div>
    );
});

MessageContent.displayName = 'MessageContent';

export default MessageContent; 