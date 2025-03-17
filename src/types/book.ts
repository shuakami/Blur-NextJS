// 文档块类型
export interface DocumentBlock {
    id: string;
    type: string;
    content: any;
    attributes?: Record<string, any>;
}

// 文档元数据
export interface DocumentMeta {
    last_modified: string;
    modified_by: string;
    collaborators: string[];
    schema_version: string;
    [key: string]: any;
}

// 文档内容
export interface DocumentContent {
    type: 'doc';
    version: number;
    blocks: DocumentBlock[];
    meta: DocumentMeta;
}

// 变更操作类型
export type OperationType = 'insert' | 'delete' | 'update' | 'move';

// 变更操作
export interface Operation {
    type: OperationType;
    path: string[];
    content?: any;
    position?: number;
}

// 变更集
export interface ChangeSet {
    version: number;
    timestamp: string;
    author: string;
    operations: Operation[];
    meta?: Record<string, any>;
}

// WebSocket消息类型
export interface ContentChangeMessage {
    content: DocumentContent;
    changes: ChangeSet;
    updated_at?: string;
}

export interface TitleUpdateMessage {
    title: string;
    updated_at?: string;
}

// UI组件Props类型
export interface HeaderButtonProps {
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
}

export interface TopActionButtonProps {
    icon: string;
    label: string;
    onClick?: () => void;
}

export interface SaveStatusProps {
    isSaving: boolean;
    lastSaveError?: Error;
    onRetry?: () => void;
    timestamp?: number | string;
}

// 编辑器状态类型
export interface EditorState {
    content: DocumentContent;
    title: string;
    isSaving: boolean;
    lastSaveTime?: string;
    lastError?: Error;
    version: number;
}

// 更新数据类型
export interface UpdateData {
    content?: DocumentContent;
    changes?: ChangeSet;
    title?: string;
} 