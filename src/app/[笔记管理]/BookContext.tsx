"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Book, fetchBook, updateBook, createBook, CreateBookRequest } from '@/api/book';
import { useUser } from '@clerk/nextjs';
import { WebSocketProvider } from './WebSocketContext';
import { createDocumentContent, generateBlockId } from '@/utils/documentUtils';

// Types
interface BookContextType {
    currentBook: Book | null;
    books: Book[];
    isLoading: boolean;
    error: Error | null;
    hasMore: boolean;
    loadBook: (bookId: string, forceRefresh?: boolean) => Promise<void>;
    loadBooks: (isInitial?: boolean) => Promise<void>;
    updateBookContent: (bookId: string, data: { content?: string; title?: string }) => Promise<void>;
    createNewBook: (data?: Partial<CreateBookRequest>) => Promise<Book>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

// Constants
const PAGE_SIZE = 20;

// API
const fetchBooks = async (userId: string, page: number = 1): Promise<{
    data: Book[];
    total: number;
}> => {
    const API_URL = process.env.NODE_ENV === 'development' 
        ? process.env.NEXT_PUBLIC_LOCAL_API_URL 
        : process.env.NEXT_PUBLIC_PROD_API_URL;
        
    const response = await fetch(
        `${API_URL}/api/v1/book?user_id=${userId}&page=${page}&page_size=${PAGE_SIZE}`
    );
    
    if (!response.ok) {
        throw new Error('Failed to fetch books');
    }
    
    return await response.json();
};

export function BookProvider({ children }: { children: React.ReactNode }) {
    return (
        <WebSocketProvider>
            <BookProviderInner>
                {children}
            </BookProviderInner>
        </WebSocketProvider>
    );
}

function BookProviderInner({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [books, setBooks] = useState<Book[]>([]);
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // 加载笔记列表
    const loadBooks = useCallback(async (isInitial: boolean = false) => {
        if (!user?.id) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            const page = isInitial ? 1 : currentPage;
            const { data: newBooks, total } = await fetchBooks(user.id, page);
            
            setBooks(prev => {
                // 如果是初始加载，直接返回新数据
                if (isInitial) return newBooks;
                
                // 使用Map进行去重，保留最新的数据
                const booksMap = new Map<string, Book>();
                
                // 先添加已有的数据
                prev.forEach(book => {
                    booksMap.set(book.id, book);
                });
                
                // 用新数据更新或添加
                newBooks.forEach(book => {
                    const existingBook = booksMap.get(book.id);
                    // 如果已存在，比较更新时间，保留最新的
                    if (existingBook) {
                        if (book.updated_at > existingBook.updated_at) {
                            booksMap.set(book.id, book);
                        }
                    } else {
                        booksMap.set(book.id, book);
                    }
                });
                
                // 转换回数组并按更新时间排序
                return Array.from(booksMap.values())
                    .sort((a, b) => b.updated_at - a.updated_at);
            });
            
            setHasMore(total > (page * PAGE_SIZE));
            setCurrentPage(prev => isInitial ? 1 : prev + 1);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading books:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, currentPage]);

    // 加载单个笔记
    const loadBook = useCallback(async (bookId: string, forceRefresh: boolean = false) => {
        if (!user?.id) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            // 如果不是强制刷新且已经加载了该笔记,直接返回
            if (!forceRefresh && currentBook?.id === bookId) {
                return;
            }
            
            const book = await fetchBook(bookId, user.id);
            setCurrentBook(book);
            
            // 更新books列表中的对应笔记
            setBooks(prev => {
                const bookIndex = prev.findIndex(b => b.id === book.id);
                if (bookIndex === -1) {
                    // 如果不在列表中，添加到开头
                    return [book, ...prev];
                } else {
                    // 如果在列表中，更新它
                    const newBooks = [...prev];
                    newBooks[bookIndex] = book;
                    return newBooks;
                }
            });
        } catch (err) {
            setError(err as Error);
            console.error('Error loading book:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, currentBook?.id]);

    // 更新笔记内容
    const updateBookContent = useCallback(async (bookId: string, data: { content?: string; title?: string }) => {
        if (!user?.id || !currentBook) return;
        
        try {
            const updateData = {
                ...data,
                version: currentBook.version,
                user_id: user.id
            };
            
            // 不立即更新,等待WebSocket消息
            // 但仍然发送HTTP请求作为备份
            updateBook(bookId, updateData).catch(err => {
                console.error('Failed to backup content:', err);
            });
        } catch (err) {
            setError(err as Error);
            console.error('Error updating book:', err);
            throw err;
        }
    }, [user?.id, currentBook]);

    // 创建新笔记
    const createNewBook = useCallback(async (data: Partial<CreateBookRequest> = {}) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        try {
            const initialContent = createDocumentContent(
                [{
                    id: generateBlockId(),
                    type: 'paragraph',
                    content: null
                }],
                1,
                user.id
            );

            const newBookData: CreateBookRequest = {
                title: data.title || '新笔记',
                content: JSON.stringify(initialContent),
                user_id: user.id,
                meta_info: {
                    schema_version: '1.0',
                    last_edited_by: user.id
                }
            };
            
            const newBook = await createBook(newBookData);
            setBooks(prev => [newBook, ...prev]);
            return newBook;
        } catch (err) {
            console.error('Error creating new book:', err);
            throw err;
        }
    }, [user?.id]);

    // 初始加载
    useEffect(() => {
        if (user?.id) {
            loadBooks(true);
        }
    }, [user?.id]);

    const value = {
        currentBook,
        books,
        isLoading,
        error,
        hasMore,
        loadBook,
        loadBooks,
        updateBookContent,
        createNewBook
    };

    return (
        <BookContext.Provider value={value}>
            {children}
        </BookContext.Provider>
    );
}

export const useBook = () => {
    const context = useContext(BookContext);
    if (!context) {
        throw new Error('useBook must be used within a BookProvider');
    }
    return context;
}; 