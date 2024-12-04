"use client"
// src/components/ApiClientProvider.tsx
import React, {useEffect} from 'react';
import {setupApiClientAuth} from '@/lib/api/config';
import {useAuth} from "@clerk/nextjs";

interface ApiClientProviderProps {
    children: React.ReactNode;
}

export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({children}) => {
    const {getToken} = useAuth();

    useEffect(() => {
        setupApiClientAuth(getToken);
    }, [getToken]);

    return <>{children}</>;
};