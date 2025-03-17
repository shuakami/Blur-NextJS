import { Message, FileInfo, SimpleUploadedFile } from "@/types/stream";

// 动画配置
export const animationConfig = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
};

// 组件Props类型定义
export interface ImagePreviewProps {
    file: File | FileInfo | SimpleUploadedFile;
}

export interface ImageGridProps {
    files: (File | FileInfo | SimpleUploadedFile)[];
}

export interface FileListProps {
    files: (File | FileInfo | SimpleUploadedFile)[];
}

export interface MessageContentProps {
    message: Message;
    isEditing: boolean;
    userId: string;
    conversationId: string;
    token: string;
    onSave?: (content: string) => Promise<void>;
    onCancel?: () => void;
}

export interface UserMessageProps {
    message: Message;
    isEditing?: boolean;
    userId: string;
    conversationId: string;
    token: string;
    onEdit?: () => void;
    onSave?: (content: string) => Promise<void>;
    onCancel?: () => void;
    onDelete?: (message: Message) => void;
} 