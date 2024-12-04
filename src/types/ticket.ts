// src/types/ticket.ts
export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'staff';
    createdAt: string;
    read?: boolean;
    type: 'text' | 'file';
    filename?: string;
    contentType?: string;
    fileSize?: number;
}

export interface Ticket {
    id: string;
    title: string;
    type: string;
    status: keyof typeof STATUS_CONFIG;
    userId: string;
    staffId: string | null;
    createdAt: string;
    updatedAt: string;
    messages?: Message[];
    unreadCount?: number;
    priority?: keyof typeof PRIORITY_CONFIG;
}

export const STATUS_CONFIG = {
    pending: {
        label: '待处理',
        className: 'text-amber-600 dark:text-amber-400'
    },
    processing: {
        label: '处理中',
        className: 'text-blue-600 dark:text-blue-400'
    },
    resolved: {
        label: '已解决',
        className: 'text-green-600 dark:text-green-400'
    },
    closed: {
        label: '已关闭',
        className: 'text-neutral-600 dark:text-neutral-400'
    }
} as const;

export const PRIORITY_CONFIG = {
    low: { 
        label: '低优先级', 
        dot: 'bg-blue-500' 
    },
    medium: { 
        label: '中优先级', 
        dot: 'bg-amber-500' 
    },
    high: { 
        label: '高优先级', 
        dot: 'bg-red-500' 
    }
} as const;
