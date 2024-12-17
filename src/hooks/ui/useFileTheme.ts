/**
 * @fileoverview 文件主题相关的 hook
 */

import {
    AppWindow,
    FileText,
    Image,
    Music,
    Video,
    File,
    Code,
    Archive,
    Table,
} from 'lucide-react';

// 文件类型分组配置
const FILE_CATEGORIES = {
    document: {
        extensions: new Set(['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt']),
        icon: FileText,
        hue: 358, // 砖红色
        label: '文档',
        color: 'text-red-500 dark:text-red-400'
    },
    image: {
        extensions: new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']),
        icon: Image,
        hue: 32, // 柔和橙色
        label: '图片',
        color: 'text-orange-500 dark:text-orange-400'
    },
    video: {
        extensions: new Set(['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']),
        icon: Video,
        hue: 285, // 优雅紫色
        label: '视频',
        color: 'text-purple-500 dark:text-purple-400'
    },
    audio: {
        extensions: new Set(['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac']),
        icon: Music,
        hue: 195, // 清新青蓝
        label: '音频',
        color: 'text-blue-500 dark:text-blue-400'
    },
    code: {
        extensions: new Set(['js', 'ts', 'py', 'java', 'cpp', 'html', 'css', 'json']),
        icon: Code,
        hue: 230, // 纯净蓝
        label: '代码',
        color: 'text-blue-500 dark:text-blue-400'
    },
    archive: {
        extensions: new Set(['zip', 'rar', '7z', 'tar', 'gz']),
        icon: Archive,
        hue: 275, // 灰紫色
        label: '压缩包',
        color: 'text-purple-500 dark:text-purple-400'
    },
    data: {
        extensions: new Set(['csv', 'xlsx', 'xls', 'db', 'sql']),
        icon: Table,
        hue: 165, // 薄荷绿
        label: '数据',
        color: 'text-green-500 dark:text-green-400'
    },
    computer: {
        extensions: new Set(['exe', 'msi', 'app', 'dmg', 'pkg']),
        icon: AppWindow,
        hue: 245, // 科技蓝紫
        label: '软件',
        color: 'text-indigo-500 dark:text-indigo-400'
    },
} as const;

// 修改类型定义
const EXTENSION_MAP = new Map<
    string, 
    { 
        icon: typeof File; 
        hue: number;
        label?: string;
        color?: string;
    }
>();

// 更新构建方式
for (const [category, config] of Object.entries(FILE_CATEGORIES)) {
    for (const ext of config.extensions) {
        EXTENSION_MAP.set(ext, {
            icon: config.icon,
            hue: config.hue,
            label: config.label,
            color: config.color
        });
    }
}

// 生成颜色
const generateColor = (hue: number) => ({
    color: `hsl(${hue}, 55%, 55%)`,
    light: `hsl(${hue}, 85%, 97%)`,
});

export const useFileTheme = () => {
    // 获取文件主题
    const getFileTheme = (file: File) => {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const typeConfig = EXTENSION_MAP.get(extension) || { icon: File, hue: 190 };
        return { icon: typeConfig.icon, ...generateColor(typeConfig.hue) };
    };

    // 格式化文件大小
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    // 新增获取文件类型信息的方法
    const getFileTypeInfo = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const typeConfig = EXTENSION_MAP.get(ext) || { 
            icon: File, 
            hue: 190,
            label: '未知格式',
            color: 'text-gray-400 dark:text-gray-500'
        };
        return typeConfig;
    };

    return {
        getFileTheme,
        formatFileSize,
        FILE_CATEGORIES,
        getFileTypeInfo,
    };
}; 