"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { fetchConversations } from './fetch_conversations';
import type { Conversation } from './types';
import { useUser } from '@clerk/nextjs';

// 常量定义
const LIMIT = 20;

interface SidebarContextType {
    conversations: Conversation[];
    loading: boolean;
    hasMore: boolean;
    error: Error | null;
    loadConversations: (isInitial?: boolean) => Promise<void>;
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const offsetRef = useRef(0);
    const loadingRef = useRef(false);

    const loadConversations = useCallback(async (isInitial = false) => {
        if (!user?.id || (!isInitial && !hasMore) || loadingRef.current) return;
        
        loadingRef.current = true;
        
        if (isInitial) {
            setLoading(true);
            setError(null);
            offsetRef.current = 0;
        }
        
        try {
            const result = await fetchConversations(user.id, {
                limit: LIMIT,
                offset: offsetRef.current
            });
            
            setConversations(prev => {
                if (isInitial) return result.conversations;
                
                const existingIds = new Set(prev.map(p => p.conversation_id));
                const newConvos = result.conversations.filter(c => 
                    !existingIds.has(c.conversation_id)
                );
                
                return [...prev, ...newConvos];
            });
            
            setHasMore(result.hasMore);
            offsetRef.current += result.conversations.length;
        } catch (err) {
            console.error('Load conversations error:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [hasMore, user?.id]);

    return (
        <SidebarContext.Provider value={{
            conversations,
            loading,
            hasMore,
            error,
            loadConversations,
            setConversations
        }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
} 