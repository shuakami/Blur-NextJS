import React, { memo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Message, FileInfo, SimpleUploadedFile } from "@/types/stream";
import { cn } from "@/lib/utils/utils";
import { FileIcon } from "lucide-react";
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

// 格式化文件大小
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 图片预览组件
const ImagePreview = memo(({ file }: { file: File | FileInfo | SimpleUploadedFile }) => {
    const getImageUrl = (file: File | FileInfo | SimpleUploadedFile): string => {
        if ('url' in file && file.url) {
            return file.url as string;
        } else if (file instanceof File) {
            return URL.createObjectURL(file);
        }
        return '';
    };

    const getImageName = (file: File | FileInfo | SimpleUploadedFile): string => {
        if ('filename' in file) return file.filename as string;
        if ('name' in file && typeof file.name === 'string') return file.name;
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
const ImageGrid = memo(({ files }: { files: (File | FileInfo | SimpleUploadedFile)[] }) => {
    const imageFiles = files.filter(file => {
        if (file instanceof File) {
            return file.type.startsWith('image/');
        }
        return file.file_type === 'image' || (file.file_type || '').startsWith('image/');
    });

    if (imageFiles.length === 0) return null;

    const gridClassName = cn(
        "grid gap-2",
        imageFiles.length === 1 ? "grid-cols-1 max-w-64" : "grid-cols-2 max-w-64"
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

// 文件列表组件
const FileList = memo(({ files }: { files: (File | FileInfo | SimpleUploadedFile)[] }) => {
    const nonImageFiles = files.filter(file => {
        if (file instanceof File) {
            return !file.type.startsWith('image/');
        }
        return file.file_type !== 'image' && !(file.file_type || '').startsWith('image/');
    });

    if (nonImageFiles.length === 0) return null;

    return (
        <div className="mt-3 space-y-2">
            {nonImageFiles.map((file, index) => {
                const name = 'filename' in file ? file.filename : (file as any).name || '未知文件';
                const size = 'size' in file ? file.size : undefined;
                
                return (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center">
                            <FileIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                {name}
                            </span>
                            {size && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatFileSize(size)}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

interface UserMessageProps {
    message: Message;
    isEditing?: boolean;
    onEdit?: () => void;
    onSave?: (content: string) => Promise<void>;
    onCancel?: () => void;
    onDelete?: (message: Message) => void;
}

// 用户消息组件
const UserMessage = memo(({ 
    message, 
    isEditing,
    onEdit,
    onSave,
    onCancel,
    onDelete 
}: UserMessageProps) => {
    const { files } = message;

    return (
        <div className="flex w-full flex-col gap-1 items-end">
            {/* 消息内容 */}
            <div className={`relative group ${isEditing ? 'w-full' : 'max-w-[70%]'}`}>
                {!isEditing && message.status !== 'inactive' && onEdit && (
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
                    {isEditing && onSave && onCancel ? (
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

            {/* 文件预览 */}
            {files && files.length > 0 && (
                <div className="w-[70%] flex flex-col items-end mt-1">
                    <ImageGrid files={files} />
                    <FileList files={files} />
                </div>
            )}
        </div>
    );
});

// 添加显示名称
ImagePreview.displayName = 'ImagePreview';
ImageGrid.displayName = 'ImageGrid';
FileList.displayName = 'FileList';
UserMessage.displayName = 'UserMessage';

export default UserMessage;