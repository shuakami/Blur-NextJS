// src/api/config.ts
import axios from 'axios';
import {ApiError, ErrorCode} from "@/types/error";

const apiClient = axios.create({
    baseURL: 'http://localhost:33413/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
        (response) => {
            return response;
        },
        (error) => {
            const apiError: ApiError = {
                code: ErrorCode.NetworkError,
                message: (error as Error).message || "发生了一个错误",
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

            const event = new CustomEvent("apiError", {detail: apiError});
            window.dispatchEvent(event);

            return Promise.reject(apiError);
        }
    );
};

export default apiClient;