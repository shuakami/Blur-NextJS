"use client";

import React, { useCallback, useEffect, useState, useMemo, memo, useRef } from 'react';
import ChatSidebar from '@/components/chat/chat_sidebar';
import { useUser } from '@clerk/nextjs';
import UnauthenticatedSidebar from "@/components/NoLogin/nologin_chat_sidebar";
import useTranslation from '../../hooks/i18n/useTranslation';
import { useRouter } from 'next/navigation';
import { Route } from 'next';
import { toast } from '../../hooks/ui/use-toast';
import { useBook } from '@/app/[笔记管理]/BookContext';
import type { Book } from '@/api/book';
import { useRouteManager } from './route_manager';

// 常量配置
const CONSTANTS = {
    DEFAULTS: {
        UNNAMED_NOTE: '未命名笔记',
        UNNAMED_USER: '未命名用户',
        USER_STATUS: 'Book#AL1_0001',
    },
    TIMEOUTS: {
        CREATE_RESET: 100,
    }
} as const;

// 类型定义
interface DateGroup {
    date: number;
    books: Book[];
}

interface SidebarGroup {
    date: number;
    children: Array<{
        id: string;
        label: string;
        href: string;
    }>;
}

interface UserInfo {
    avatarUrl: string;
    name: string;
    status: string;
}

interface BookSidebarProps {
    onClose?: () => void;
    onUpdateBooks?: (loadBooks: () => void) => void;
}

// 日期处理工具
const DateUtils = {
    cache: new Map<string, string>(),
    
    getKey(timestamp: string | number | Date): string {
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const key = date.toDateString();
        const cacheKey = date.toISOString();
        
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;
        
        this.cache.set(cacheKey, key);
        return key;
    },
    
    sortBooks(books: Book[]): Book[] {
        return [...books].sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }
};

// 日志工具
const Logger = {
    info(message: string, data?: any) {
        console.log(`[BookSidebar] ${message}`, data);
    },
    error(message: string, error?: any) {
        console.error(`[BookSidebar] ${message}`, error);
    }
};

// 日期分组函数
const groupBooksByDate = (books: Book[], t: (key: string) => string): SidebarGroup[] => {
    if (!books.length) return [];
    
    const grouped = new Map<string, DateGroup>();
    const sorted = DateUtils.sortBooks(books);
    
    for (const book of sorted) {
        const dateKey = DateUtils.getKey(book.updated_at);
        const timestamp = new Date(book.updated_at).getTime();
        
        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, {
                date: timestamp,
                books: []
            });
        }
        grouped.get(dateKey)!.books.push(book);
    }
    
    return Array.from(grouped.values()).map(({ date, books }) => ({
        date,
        children: books.map(book => ({
            id: book.id,
            label: book.title || t(CONSTANTS.DEFAULTS.UNNAMED_NOTE),
            href: `/book/${book.id}`,
        }))
    }));
};

const BookSidebar = memo<BookSidebarProps>(({
    onClose = () => {},
    onUpdateBooks
}) => {
    const { t } = useTranslation();
    const { isSignedIn, user, isLoaded } = useUser();
    
    const { 
        books,
        isLoading,
        error,
        hasMore,
        loadBooks,
        createNewBook,
        loadBook
    } = useBook();

    // 使用新的路由管理器
    const {
        currentId,
        isRouting,
        updateRoute
    } = useRouteManager('book', (id) => {
        loadBook(id, true);
    });

    // 创建状态管理
    const [isCreating, setIsCreating] = useState(false);

    // 创建新笔记
    const handleCreateNew = useCallback(async () => {
        if (!user?.id || isCreating) return;
        
        setIsCreating(true);
        
        try {
            const newBook = await createNewBook({
                title: t(CONSTANTS.DEFAULTS.UNNAMED_NOTE),
                content: '',
                user_id: user.id
            });
            
            Logger.info('新建笔记，准备更新URL:', newBook.id);
            updateRoute(newBook.id);
            
            onUpdateBooks?.(() => loadBooks(true));
        } catch (err) {
            Logger.error('Create book error:', err);
            toast({
                title: '创建笔记失败',
                description: '请稍后重试',
                variant: "destructive"
            });
        } finally {
            setTimeout(() => {
                setIsCreating(false);
            }, CONSTANTS.TIMEOUTS.CREATE_RESET);
        }
    }, [user?.id, createNewBook, loadBooks, onUpdateBooks, t, updateRoute]);

    // 加载状态处理
    const isPageLoading = isLoading || isRouting;

    // 优化侧边栏项目计算
    const sidebarItems = useMemo(() => 
        groupBooksByDate(books, t),
        [books, t]
    );

    // 优化用户信息计算
    const userInfo = useMemo<UserInfo>(() => ({
        avatarUrl: user?.imageUrl || '',
        name: user?.fullName || t(CONSTANTS.DEFAULTS.UNNAMED_USER),
        status: CONSTANTS.DEFAULTS.USER_STATUS,
    }), [user?.imageUrl, user?.fullName, t]);

    if (isLoaded && !isSignedIn) {
        return <UnauthenticatedSidebar onClose={onClose} />;
    }

    return (
        <ChatSidebar 
            items={sidebarItems} 
            user={userInfo} 
            onClose={onClose} 
            onUpdateConversations={() => loadBooks(true)}
            onLoadMore={() => loadBooks(false)}
            hasMore={hasMore}
            loading={isPageLoading}
            mode="book"
            onCreateNew={handleCreateNew}
            selectedItem={currentId}
            onSelect={updateRoute}
            isCreating={isCreating}
        />
    );
});

BookSidebar.displayName = 'BookSidebar';

export default BookSidebar;