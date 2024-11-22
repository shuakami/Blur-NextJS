// ApiAdapter.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ConnectionError, ApiAdapterConfig } from '@/types/connection';

interface RateLimitConfig {
    maxRequests: number;      // 单位时间内最大请求数
    timeWindow: number;       // 时间窗口（毫秒）
    minInterval: number;      // 两次请求的最小间隔
}

interface RequestRecord {
    timestamp: number;
    url: string;
}

export class ApiAdapter {
    private client: AxiosInstance;
    private readonly config: Required<ApiAdapterConfig>;
    
    // 请求历史记录
    private requestHistory: RequestRecord[] = [];
    
    // 限流配置
    private readonly rateLimits: Record<string, RateLimitConfig> = {
        default: {
            maxRequests: 60,
            timeWindow: 60000,  // 1分钟
            minInterval: 1000   // 1秒
        },
        heartbeat: {
            maxRequests: 12,    // 每分钟最多12次心跳
            timeWindow: 60000,
            minInterval: 5000   // 最小5秒间隔
        },
        sync: {
            maxRequests: 6,     // 每分钟最多6次同步
            timeWindow: 60000,
            minInterval: 10000  // 最小10秒间隔
        }
    };

    // 使用 Map 来分别存储不同 URL 的最后请求时间
    private lastRequestTimes: Map<string, number> = new Map();

    constructor(config: ApiAdapterConfig) {
        this.config = {
            timeout: 5000,
            maxRetries: 3,
            retryDelay: 1000,
            ...config
        };

        this.client = axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.client.interceptors.request.use(
            async (config) => {
                const url = config.url || '';
                const rateLimit = this.getRateLimitConfig(url);
                await this.waitForRateLimit(url, rateLimit);
                
                // 优化超时设置
                if (url.includes('/heartbeat')) {
                    config.timeout = 3500;
                }
                
                return config;
            },
            error => Promise.reject(this.normalizeError(error))
        );

        this.client.interceptors.response.use(
            (response) => {
                // 记录成功的请求
                this.recordRequest(response.config.url || '');
                return response;
            },
            (error) => Promise.reject(this.normalizeError(error))
        );
    }

    private getRateLimitConfig(url: string): RateLimitConfig {
        if (url.includes('/heartbeat')) return this.rateLimits.heartbeat;
        if (url.includes('/sync')) return this.rateLimits.sync;
        return this.rateLimits.default;
    }

    private async waitForRateLimit(url: string, rateLimit: RateLimitConfig): Promise<void> {
        const now = Date.now();
        const lastRequestTime = this.lastRequestTimes.get(url) || 0;
        const timeSinceLastRequest = now - lastRequestTime;
        
        if (timeSinceLastRequest < rateLimit.minInterval) {
            const waitTime = rateLimit.minInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTimes.set(url, Date.now());
    }

    private recordRequest(url: string) {
        this.requestHistory.push({
            timestamp: Date.now(),
            url
        });
    }

    private normalizeError(error: AxiosError): ConnectionError {
        const retryable = this.isRetryableError(error);
        return {
            code: error.code || 'UNKNOWN_ERROR',
            status: error.response?.status,
            message: this.getErrorMessage(error),
            retryable
        };
    }

    private getErrorMessage(error: AxiosError): string {
        if (error.response?.status === 429) {
            return '请求过于频繁，请稍后再试';
        }
        return error.message || '未知错误';
    }

    private isRetryableError(error: AxiosError): boolean {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return true;
        }
        const status = error.response?.status;
        return [408, 429, 500, 503].includes(status || 0);
    }

    public async request<T>(config: AxiosRequestConfig): Promise<T> {
        let retryCount = 0;
        while (true) {
            try {
                const response = await this.client.request<T>(config);
                this.recordRequest(response.config.url || '');
                return response.data;
            } catch (error) {
                const normalizedError = this.normalizeError(error as AxiosError);
                if (normalizedError.retryable && retryCount < this.config.maxRetries) {
                    retryCount++;
                    const delay = Math.min(
                        this.config.retryDelay * Math.pow(2, retryCount - 1),
                        5000
                    );
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue; // 重试请求
                }
                throw normalizedError;
            }
        }
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: 'GET', url });
    }
}

// 创建实例
export const apiAdapter = new ApiAdapter({
    baseURL: process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_PROD_API_URL!
        : process.env.NEXT_PUBLIC_LOCAL_API_URL!,
    timeout: 5000,
    maxRetries: 3,
    retryDelay: 1000
});
