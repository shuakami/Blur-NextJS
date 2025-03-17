import { FileInfo, SimpleUploadedFile } from "@/types/stream";

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 获取图片URL
 */
export const getImageUrl = (file: File | FileInfo | SimpleUploadedFile): string => {
    if ('url' in file && file.url) {
        return file.url as string;
    } else if (file instanceof File) {
        return URL.createObjectURL(file);
    }
    return '';
};

/**
 * 获取图片名称
 */
export const getImageName = (file: File | FileInfo | SimpleUploadedFile): string => {
    if ('filename' in file) return file.filename as string;
    if ('name' in file && typeof file.name === 'string') return file.name;
    return 'image';
};

/**
 * 判断文件是否为图片
 */
export const isImageFile = (file: File | FileInfo | SimpleUploadedFile): boolean => {
    if (file instanceof File) {
        return file.type.startsWith('image/');
    }
    return file.file_type === 'image' || (file.file_type || '').startsWith('image/');
}; 