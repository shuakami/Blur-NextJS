/**
 * @file config.ts
 * @description 配置 Axios API 客户端，处理请求和响应拦截器。
 * 
 * 该文件创建了一个 Axios 实例，并根据环境变量设置基本 URL。它还实现了
 * 令牌刷新机制，以确保在令牌即将过期时自动刷新令牌。
 * 
 * 主要功能：
 * - 根据环境变量设置 API 基础 URL。
 * - 在请求中添加认证令牌。
 * - 处理令牌刷新，确保在令牌即将过期时自动获取新令牌。
 * - 处理 API 错误并通过事件通知。
 * 
 * 可用方法：
 * - `setupApiClientAuth(getToken: () => Promise<string | null>)`: 设置 API 客户端的认证拦截器。
 *   - 参数:
 *     - `getToken`: 一个返回 Promise 的函数，用于获取当前的认证令牌。
 * 
 * @module apiClient
 */

import axios from 'axios';
import {ApiError, ErrorCode} from "@/types/error";

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