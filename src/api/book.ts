// 笔记内容类型定义
export interface BookContent {
    type: string;
    content: Array<{
        type: string;
        attrs?: Record<string, any>;
        content?: Array<{
            type: string;
            text?: string;
            [key: string]: any;
        }>;
    }>;
}

// 笔记元信息类型定义
export interface BookMetaInfo {
    schema_version: string;
    last_edited_by: string;
    [key: string]: any;
}

// 笔记数据类型定义
export interface Book {
    id: string;
    title: string;
    content: string;  // JSON string of BookContent
    user_id: string;
    parent_id: string | null;
    created_at: number;
    updated_at: number;
    version: number;
    meta_info: BookMetaInfo;
    tags: string[];
    children: Book[];
}

// API请求类型
export interface CreateBookRequest {
    title: string;
    content: string;  // JSON string of BookContent
    user_id: string;
    meta_info: BookMetaInfo;
}

export interface UpdateBookRequest {
    content?: string;  // JSON string of BookContent
    title?: string;
    version: number;
}

// API响应类型
export interface ApiResponse<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}

// 获取笔记详情
export async function fetchBook(bookId: string, userId: string): Promise<Book> {
    try {
        const API_URL = process.env.NODE_ENV === 'development' 
            ? process.env.NEXT_PUBLIC_LOCAL_API_URL 
            : process.env.NEXT_PUBLIC_PROD_API_URL;

        const response = await fetch(`${API_URL}/api/v1/book/${bookId}?user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse<Book> = await response.json();
        
        if (result.status === 'error') {
            throw new Error(result.message);
        }

        return result.data;
    } catch (error) {
        console.error('Error fetching book:', error);
        throw error;
    }
}

// 更新笔记内容
export async function updateBook(bookId: string, data: UpdateBookRequest & { user_id: string }): Promise<Book> {
    try {
        const API_URL = process.env.NODE_ENV === 'development' 
            ? process.env.NEXT_PUBLIC_LOCAL_API_URL 
            : process.env.NEXT_PUBLIC_PROD_API_URL;

        const { user_id, ...updateData } = data;
        const response = await fetch(`${API_URL}/api/v1/book/${bookId}?user_id=${user_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse<Book> = await response.json();
        
        if (result.status === 'error') {
            throw new Error(result.message);
        }

        return result.data;
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
}

// 创建新笔记
export async function createBook(data: CreateBookRequest): Promise<Book> {
    try {
        const API_URL = process.env.NODE_ENV === 'development' 
            ? process.env.NEXT_PUBLIC_LOCAL_API_URL 
            : process.env.NEXT_PUBLIC_PROD_API_URL;

        const response = await fetch(`${API_URL}/api/v1/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse<Book> = await response.json();
        
        if (result.status === 'error') {
            throw new Error(result.message);
        }

        return result.data;
    } catch (error) {
        console.error('Error creating book:', error);
        throw error;
    }
} 