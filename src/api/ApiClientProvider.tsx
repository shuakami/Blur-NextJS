"use client"
// src/components/ApiClientProvider.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { setupApiClientAuth } from '@/lib/api/config';
import { useAuth } from "@clerk/nextjs";

interface ApiClientProviderProps {
    children: React.ReactNode;
}

export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({children}) => {
    const { getToken } = useAuth();
    const isInitializedRef = useRef(false);
    const errorRef = useRef<Error | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout>();

    const initializeAuth = useCallback(async () => {
        if (isInitializedRef.current) return;

        try {
            await setupApiClientAuth(getToken);
            isInitializedRef.current = true;
            errorRef.current = null;
        } catch (err) {
            console.error('Failed to initialize API client auth:', err);
            errorRef.current = err as Error;
            
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            
            retryTimeoutRef.current = setTimeout(() => {
                if (!isInitializedRef.current) {
                    initializeAuth();
                }
            }, 3000);
        }
    }, [getToken]);

    useEffect(() => {
        initializeAuth();

        const handleOnline = () => {
            if (!isInitializedRef.current) {
                initializeAuth();
            }
        };

        window.addEventListener('online', handleOnline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [initializeAuth]);

    if (!isInitializedRef.current && !errorRef.current) {
        return null;
    }

    if (errorRef.current) {
        console.error('API client initialization error:', errorRef.current);
        return null;
    }

    return <>{children}</>;
};