"use client"
import React, {useEffect} from 'react';
import {useToast} from "@/hooks/use-toast";
import {ApiError, ErrorCode} from "@/types/error";
import useTranslation from "@/hooks/useTranslation";

const GlobalErrorHandler: React.FC = () => {
    const {toast} = useToast();
    const {t} = useTranslation('error');

    useEffect(() => {
        const handleErrors = (error: ApiError) => {
            switch (error.code) {
                case ErrorCode.LoginError:
                    toast({
                        variant: "destructive",
                        title: t("登录错误"),
                        description: t("请检查您的用户名和密码。"),
                    });
                    break;
                case ErrorCode.NetworkError:
                    toast({
                        variant: "destructive",
                        title: t("网络错误"),
                        description: t("请检查您的网络连接。"),
                    });
                    break;
                case ErrorCode.NotFound:
                    toast({
                        variant: "destructive",
                        title: t("未找到"),
                        description: t("请求的资源未找到。"),
                    });
                    break;
                case ErrorCode.Unauthorized:
                    toast({
                        variant: "destructive",
                        title: t("未授权"),
                        description: t("您没有权限访问此资源。"),
                    });
                    break;
                case ErrorCode.Forbidden:
                    toast({
                        variant: "destructive",
                        title: t("禁止访问"),
                        description: t("您没有权限访问此资源。"),
                    });
                    break;
                case ErrorCode.BadRequest:
                    toast({
                        variant: "destructive",
                        title: t("请求错误"),
                        description: t("请求参数不正确。"),
                    });
                    break;
                default:
                    toast({
                        variant: "destructive",
                        title: t("发生了未知错误"),
                        description: t(error.message),
                    });
            }
        };

        const errorListener = (event: any) => {
            const apiError: ApiError = event.detail;
            handleErrors(apiError);
        };

        // 监听来自 Axios 的错误事件
        window.addEventListener("apiError", errorListener);

        return () => {
            window.removeEventListener("apiError", errorListener);
        };
    }, [toast, t]);

    return null;
};

export default GlobalErrorHandler;
