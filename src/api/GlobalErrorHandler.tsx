"use client"
import React, {useEffect} from 'react';
import {ApiError, ErrorCode} from "@/types/error";
import useTranslation from '@/hooks/i18n/useTranslation';
import { useToast } from '@/hooks/ui/use-toast';


const GlobalErrorHandler: React.FC = () => {
    const {toast} = useToast();
    const {t} = useTranslation();

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
                        title: t("网络错误，请检查您的网络连接。")
                    });
                    break;
                case ErrorCode.NotFound:
                    toast({
                        variant: "destructive",
                        title: t("404 Not Found"),
                    });
                    break;
                case ErrorCode.Unauthorized:
                    toast({
                        variant: "destructive",
                        title: t("您似乎没有登录，无法访问此资源。"),
                    });
                    break;
                case ErrorCode.Forbidden:
                    toast({
                        variant: "destructive",
                        title: t("您没有权限访问此资源。")
                    });
                    break;
                case ErrorCode.BadRequest:
                    toast({
                        variant: "destructive",
                        title: t("请求错误"),
                        description: t("请求参数不正确。"),
                    });
                    break;
                case ErrorCode.TokenRefreshError:
                    toast({
                        variant: "destructive",
                        title: t("Token 刷新错误"),
                        description: t("请重新登录。"),
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
