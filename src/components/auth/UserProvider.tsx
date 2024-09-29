// src/components/auth/UserProvider.tsx

"use client";

import {useUser, useAuth} from "@clerk/nextjs";
import React, {createContext, useContext, useEffect, useState} from "react";

// 定义用户信息类型
interface UserContextType {
    userId: string | null;
    name: string | null;
    jwt: string | null;
    isLoading: boolean;
}

// 创建用户上下文
const UserContext = createContext<UserContextType | undefined>(undefined);

// 定义提供者组件
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {isLoaded, user} = useUser();  // 从 Clerk 获取用户信息
    const {getToken} = useAuth();        // 获取 JWT
    const [jwt, setJwt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJwt = async () => {
            try {
                const token = await getToken(); // 获取JWT
                setJwt(token);
            } catch (error) {
                console.error("Error fetching JWT:", error);
            } finally {
                setIsLoading(false);  // 完成加载
            }
        };

        if (isLoaded) {
            fetchJwt(); // 加载JWT
        }
    }, [isLoaded, getToken]);

    const userId = user?.id || null;
    const name = user?.fullName || null;

    // 创建上下文值
    const contextValue = {
        userId,
        name,
        jwt,
        isLoading: !isLoaded || isLoading,
    };

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

// 自定义 Hook 用于访问用户信息
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext 必须在 UserProvider 内使用");
    }
    return context;
};
