// src/api/config.ts
import axios from 'axios';

// 创建 Axios 实例
const apiClient = axios.create({
    baseURL: 'http://localhost:33413/api/v1', // 基础 URL
    timeout: 10000, // 请求超时时间（10秒）
    headers: {
        'Content-Type': 'application/json',
        // 根据需要添加其他默认头部
    },
});

// 请求拦截器（可选）
apiClient.interceptors.request.use(
    (config: any) => {
        // 在发送请求之前做些什么，例如添加认证令牌
        // config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error: any) => {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 响应拦截器（可选）
apiClient.interceptors.response.use(
    (response: any) => {
        // 对响应数据做点什么
        return response;
    },
    (error: any) => {
        // 对响应错误做点什么
        return Promise.reject(error);
    }
);

export default apiClient;
