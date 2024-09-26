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

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const apiError: ApiError = {
            code: ErrorCode.NetworkError, // 默认错误码
            message: error.message || "发生了一个错误",
        };

        if (error.response) {
            if (error.response.status === 404) {
                apiError.code = ErrorCode.NotFound;
            } else if (error.response.status === 401) {
                apiError.code = ErrorCode.LoginError;
            } else if (error.response.status === 403) {
                apiError.code = ErrorCode.Forbidden;
            } else if (error.response.status === 500) {
                apiError.code = ErrorCode.InternalServerError;
            } else if (error.response.status === 422) {
                apiError.code = ErrorCode.UnprocessableEntity;
            } else if (error.response.status === 408) {
                apiError.code = ErrorCode.Timeout;
            } else if (error.response.status === 429) {
                apiError.code = ErrorCode.TooManyRequests;
            } else if (error.response.status === 400) {
                apiError.code = ErrorCode.BadRequest;
            }
        }

        // 触发自定义事件，将错误传递到全局错误处理组件
        const event = new CustomEvent("apiError", {detail: apiError});
        window.dispatchEvent(event);

        return Promise.reject(apiError);
    }
);

export default apiClient;
