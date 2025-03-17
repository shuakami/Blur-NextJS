/**
 * ErrorHandler - 全局错误处理器
 * 
 * @class ErrorHandler
 * 
 * @property errorMessages - 错误消息映射表
 * @property errorTypes - 错误类型映射表
 * 
 * @method handle - 处理并标准化错误
 * @method getUserMessage - 获取用户友好的错误消息
 * @method getErrorType - 获取错误类型
 * @method isNetworkError - 检查是否为网络错误
 * @method isAuthError - 检查是否为认证错误
 */

// 错误类型定义
export type ErrorType = 
    | 'NETWORK_ERROR'    // 网络错误
    | 'TIMEOUT_ERROR'    // 超时错误
    | 'VALIDATION_ERROR' // 验证错误
    | 'SERVER_ERROR'     // 服务器错误
    | 'CONNECTION_ERROR' // 连接错误
    | 'UNKNOWN_ERROR';   // 未知错误

// 错误接口
export interface AppError extends Error {
    type: ErrorType;
    details?: any;
}

// 创建错误
function createError(message: string | undefined, type: ErrorType, details?: any): AppError {
    // 确保message是字符串
    const errorMessage = typeof message === 'string' ? message : '未知错误';
    const error = new Error(errorMessage) as AppError;
    error.type = type;
    error.details = details;
    return error;
}

export class ErrorHandler {
    // 处理错误
    static handle(error: any): AppError {
        // 如果error是undefined或null，返回默认错误
        if (!error) {
            return createError('未知错误', 'UNKNOWN_ERROR');
        }

        // 如果已经是AppError，直接返回
        if (this.isAppError(error)) {
            return error;
        }
        
        // 如果是标准Error对象
        if (error instanceof Error) {
            return this.categorizeError(error);
        }
        
        // 如果是字符串
        if (typeof error === 'string') {
            return createError(error, 'UNKNOWN_ERROR');
        }

        // 如果是对象，尝试提取message
        if (typeof error === 'object') {
            // 检查是否是连接被拒绝错误
            if (error.code === 'ERR_CONNECTION_REFUSED' || 
                error.message?.includes('ECONNREFUSED') ||
                error.message?.includes('connection refused')) {
                return createError(
                    '无法连接到服务器',
                    'CONNECTION_ERROR',
                    error
                );
            }

            return createError(
                error.message || JSON.stringify(error),
                'UNKNOWN_ERROR',
                error
            );
        }
        
        // 其他情况
        return createError(
            String(error),
            'UNKNOWN_ERROR',
            error
        );
    }
    
    // 判断是否为应用错误
    private static isAppError(error: any): error is AppError {
        return error instanceof Error && 
               'type' in error && 
               typeof error.type === 'string';
    }
    
    // 分类错误
    private static categorizeError(error: Error): AppError {
        // 确保message存在且是字符串
        const message = typeof error?.message === 'string' ? 
            error.message.toLowerCase() : '';
        
        if (this.isNetworkError(message)) {
            return createError('网络连接错误', 'NETWORK_ERROR', error);
        }
        
        if (this.isTimeoutError(message)) {
            return createError('操作超时', 'TIMEOUT_ERROR', error);
        }
        
        if (this.isServerError(message)) {
            return createError('服务器错误', 'SERVER_ERROR', error);
        }

        if (this.isConnectionError(message)) {
            return createError('无法连接到服务器', 'CONNECTION_ERROR', error);
        }
        
        return createError(
            error?.message || '未知错误',
            'UNKNOWN_ERROR',
            error
        );
    }
    
    // 判断错误类型
    private static isNetworkError(message: string): boolean {
        if (!message) return false;
        return message.includes('network') || 
               message.includes('网络') ||
               message.includes('connection') ||
               message.includes('连接');
    }
    
    private static isTimeoutError(message: string): boolean {
        if (!message) return false;
        return message.includes('timeout') || 
               message.includes('超时');
    }
    
    private static isServerError(message: string): boolean {
        if (!message) return false;
        return message.includes('server') || 
               message.includes('服务器');
    }

    private static isConnectionError(message: string): boolean {
        if (!message) return false;
        return message.includes('econnrefused') ||
               message.includes('connection refused') ||
               message.includes('无法连接') ||
               message.includes('connect failed');
    }
    
    // 获取用户友好的错误消息
    static getUserMessage(error: AppError | null | undefined): string {
        if (!error) return '发生未知错误';
        
        switch (error.type) {
            case 'NETWORK_ERROR':
                return '网络连接不稳定,请检查网络后重试';
            case 'TIMEOUT_ERROR':
                return '操作超时,请重试';
            case 'VALIDATION_ERROR':
                return '输入数据无效';
            case 'SERVER_ERROR':
                return '服务器出现错误,请稍后重试';
            case 'CONNECTION_ERROR':
                return '无法连接到服务器';
            default:
                return error.message || '发生未知错误';
        }
    }
    
    // 判断是否需要重试
    static shouldRetry(error: AppError | null | undefined): boolean {
        if (!error) return false;
        return error.type === 'NETWORK_ERROR' || 
               error.type === 'TIMEOUT_ERROR' ||
               error.type === 'CONNECTION_ERROR';
    }
} 