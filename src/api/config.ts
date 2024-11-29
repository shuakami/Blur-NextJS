// src/api/config.ts
import axios from 'axios';
import {ApiError, ErrorCode} from "@/types/error";
import { useAuth } from '@clerk/nextjs';

const apiClient = axios.create({
    // 如果是生产环境，读取NEXT_PUBLIC_PROD_API_URL，不是就读取NEXT_PUBLIC_LOCAL_API_URL
    baseURL: process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_PROD_API_URL
        : process.env.NEXT_PUBLIC_LOCAL_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 添加token刷新状态控制
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
};

export const setupApiClientAuth = (getToken: () => Promise<string | null>) => {
    apiClient.interceptors.request.use(
        async (config) => {
            try {
                const token = await getToken();

                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                } else {
                    return Promise.reject({
                        code: ErrorCode.LoginError,
                        message: "You are not logged in.",
                    });
                }

                return config;
            } catch (error) {
                return Promise.reject({
                    code: ErrorCode.NetworkError,
                    message: "Error getting authentication token",
                });
            }
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    apiClient.interceptors.response.use(
        async (response) => {
            const tokenExpireSoon = response.headers['x-token-expire-soon'];
            
            if (tokenExpireSoon === 'true' && !isRefreshing) {
                isRefreshing = true;
                
                try {
                    // 触发 Clerk 的 token 刷新
                    const newToken = await getToken();
                    
                    if (newToken) {
                        // 通知所有等待的请求
                        onTokenRefreshed(newToken);
                    }
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    // 触发错误事件
                    const apiError: ApiError = {
                        code: ErrorCode.TokenRefreshError,
                        message: "Failed to refresh token",
                    };
                    window.dispatchEvent(new CustomEvent("apiError", { detail: apiError }));
                } finally {
                    isRefreshing = false;
                }
            }
            
            return response;
        },
        (error) => {
            const apiError: ApiError = {
                code: ErrorCode.NetworkError,
                message: (error as Error).message || "Network Error",
            };

            if (error.response) {
                apiError.code = error.response.status === 404 ? ErrorCode.NotFound :
                    error.response.status === 401 ? ErrorCode.LoginError :
                        error.response.status === 403 ? ErrorCode.Forbidden :
                            error.response.status === 500 ? ErrorCode.InternalServerError :
                                error.response.status === 422 ? ErrorCode.UnprocessableEntity :
                                    error.response.status === 408 ? ErrorCode.Timeout :
                                        error.response.status === 429 ? ErrorCode.TooManyRequests :
                                            error.response.status === 400 ? ErrorCode.BadRequest : ErrorCode.NetworkError;
            }

            window.dispatchEvent(new CustomEvent("apiError", { detail: apiError }));
            return Promise.reject(apiError);
        }
    );
};

export default apiClient;