import React, { memo, lazy, Suspense } from "react";
import { useMessageContext } from "@/app/[上下文]/ChatContext";
import { UserMessageProps } from "./message/types";
import { default as MessageImageGrid } from "./message/ImageGrid";
import { default as MessageFileList } from "./message/FileList";
import MessageContent from "./message/MessageContent";

// 懒加载编辑按钮
const EditButton = lazy(() => import("@/components/ui/LLM/EditButton"));

// 用户消息组件
const UserMessage = memo(({ 
    message,
    isEditing,
    userId,
    conversationId,
    token,
    onEdit,
    onSave,
    onCancel,
    onDelete 
}: UserMessageProps) => {
    const canEdit = message.message_id && onEdit;
    const { files } = message;

    return (
        <div className="flex w-full flex-col gap-1 items-end">
            {/* 消息内容 */}
            <div className={`relative group ${isEditing ? 'w-full' : 'max-w-[70%]'}`}>
                {canEdit && !isEditing && (
                    <div className="absolute right-full top-1 mr-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Suspense fallback={null}>
                            <EditButton onClick={onEdit} />
                        </Suspense>
                    </div>
                )}
                
                <MessageContent
                    message={message}
                    isEditing={isEditing || false}
                    userId={userId}
                    conversationId={conversationId}
                    token={token}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            </div>

            {/* 文件预览 */}
            {files && files.length > 0 && (
                <div className="w-[70%] flex flex-col items-end mt-1">
                    <MessageImageGrid files={files} />
                    <MessageFileList files={files} />
                </div>
            )}
        </div>
    );
});

UserMessage.displayName = 'UserMessage';

export default UserMessage;