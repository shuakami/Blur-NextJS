import React, { memo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Message, FileInfo } from "@/types/stream";
import { cn } from "@/lib/utils/utils";
import { Image } from "@/components/ui/markdown/image";

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

// 图片预览组件
const ImagePreview = memo(({ file }: { file: File | FileInfo }) => {
    const getImageUrl = (file: File | FileInfo): string => {
        if ('url' in file && file.url) {
            return file.url;
        } else if ('base64_data' in file && file.base64_data) {
            return `data:image/${file.type};base64,${file.base64_data}`;
        } else if (file instanceof File) {
            return URL.createObjectURL(file);
        }
        return '';
    };

    const getImageName = (file: File | FileInfo): string => {
        if ('name' in file && file.name) {
            return file.name;
        } else if ('key' in file && file.key) {
            return file.key.split('/').pop() || 'image';
        }
        return 'image';
    };

    const imageUrl = getImageUrl(file);
    const imageName = getImageName(file);
    
    return (
        <div className="relative overflow-hidden">
            <Image
                src={imageUrl || ''}
                alt={imageName}
                className="w-full h-full object-cover my-0"
            />
        </div>
    );
});

// 图片网格组件
const ImageGrid = memo(({ files }: { files: (File | FileInfo)[] }) => {
    const imageFiles = files.filter(file => {
        if (file instanceof File) {
            return file.type.startsWith('image/');
        }
        return file.file_type === 'image' || file.type.startsWith('image/');
    });

    if (imageFiles.length === 0) return null;

    const gridClassName = cn(
        "grid gap-2",
        imageFiles.length === 1 
            ? "grid-cols-1 max-w-64" 
            : "grid-cols-2 max-w-64"
    );

    return (
        <div className="mt-3">
            <div className={gridClassName}>
                {imageFiles.map((file, index) => (
                    <div key={index}>
                        <ImagePreview file={file} />
                    </div>
                ))}
            </div>
        </div>
    );
});

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
        <div className="flex w-full flex-col gap-1 items-end">
            {/* 消息内容 */}
            <div className={`relative group ${isEditing ? 'w-full' : 'max-w-[70%]'}`}>
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
            </div>

            {/* 图片 */}
            {message.files && message.files.length > 0 && (
                <div className="w-[70%] flex justify-end mt-1">
                    <ImageGrid files={message.files} />
                </div>
            )}
        </div>
    );
});

ImagePreview.displayName = 'ImagePreview';
ImageGrid.displayName = 'ImageGrid';
UserMessage.displayName = 'UserMessage';

export default UserMessage;