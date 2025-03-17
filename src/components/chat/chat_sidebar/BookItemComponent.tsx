"use client";

import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import {
    ChevronRight, ChevronDown, MoreHorizontal,
    Check, X, PencilLine, Trash2,
    Book,
} from 'lucide-react';
import { SidebarItem } from './types';
import CustomButton from './CustomButton';
import DropDownMenu from "@/components/ui/tofu/dropdown-menu";
import { useUser } from '@clerk/nextjs';
import { toast } from '../../../hooks/ui/use-toast';
import ConfirmModal from "@/components/ui/tofu/confirm-modal";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useShortcutManager } from '@/providers/ShortcutProvider'
import { SHORTCUTS, SHORTCUT_DESCRIPTIONS } from '@/constants/shortcuts'
import { Route } from 'next';

// 常量定义
const CONSTANTS = {
    ANIMATION: {
        INTERVAL: 60,
        TRANSITION: {
            enter: 'transition-[height] duration-200 ease-out',
            enterFrom: 'h-0',
            enterTo: 'h-auto',
            leave: 'transition-[height] duration-200 ease-in',
            leaveFrom: 'h-auto',
            leaveTo: 'h-0'
        }
    },
    API: {
        getBaseUrl: () => process.env.NODE_ENV === 'development' 
            ? process.env.NEXT_PUBLIC_LOCAL_API_URL 
            : process.env.NEXT_PUBLIC_PROD_API_URL
    }
} as const;

interface BookItemComponentProps {
    item: SidebarItem;
    level: number;
    selectedItem: string | null;
    onSelect: (label: string) => void;
    onUpdateBooks: () => void;
}

interface UIState {
    isOpen: boolean;
    menuOpen: boolean;
    isEditing: boolean;
    isModalOpen: boolean;
    hover: boolean;
    displayedTitle: string;
    newTitle: string;
    isDeleting: boolean;
}

// 错误处理工具函数
const handleApiError = (error: unknown, action: string) => {
    console.error(`Failed to ${action}:`, error);
    toast({
        title: '操作失败',
        description: `${action}失败`,
        variant: "destructive"
    });
};

const BookItemComponent = memo<BookItemComponentProps>(({
    item,
    level,
    selectedItem,
    onSelect,
    onUpdateBooks,
}) => {
    const { user } = useUser();
    const router = useRouter();
    const shortcutManager = useShortcutManager();

    // Refs
    const buttonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const previousTitleRef = useRef(item.label);
    const isRoutingRef = useRef(false);
    const animationFrameRef = useRef<number>();
    const intervalRef = useRef<NodeJS.Timeout>();

    // 状态管理
    const [uiState, setUiState] = useState<UIState>({
        isOpen: true,
        menuOpen: false,
        isEditing: false,
        isModalOpen: false,
        hover: false,
        displayedTitle: item.label,
        newTitle: item.label,
        isDeleting: false,
    });

    // 计算属性
    const isSelected = selectedItem === item.id;

    // 状态更新函数
    const updateState = useCallback((updates: Partial<UIState>) => {
        setUiState(prev => ({ ...prev, ...updates }));
    }, []);

    // API请求工具函数
    const makeApiRequest = async (method: string, endpoint: string, body?: object) => {
        const baseUrl = CONSTANTS.API.getBaseUrl();
        const response = await fetch(`${baseUrl}/api/v1/${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        return response;
    };

    // 菜单项定义
    const menuItems = useMemo(() => [
        {
            id: 'update-title',
            text: '更改笔记标题',
            icon: PencilLine,
            onClick: () => {
                updateState({ isEditing: true, menuOpen: false });
            },
        },
        {
            id: 'delete-book',
            text: '删除笔记',
            icon: Trash2,
            isDanger: true,
            onClick: () => {
                updateState({ isModalOpen: true, menuOpen: false });
            },
        },
    ], [updateState]);

    // 处理删除确认
    const handleConfirmDelete = useCallback(async () => {
        if (!item.id) return;
        
        updateState({ isDeleting: true });
        try {
            const API_URL = CONSTANTS.API.getBaseUrl();
            const response = await fetch(
                `${API_URL}/api/v1/book/${item.id}?user_id=${user?.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to delete book');
            }
            
            if (isSelected) {
                router.push('/book' as Route);
            }
            
            onUpdateBooks();
            toast({
                title: '操作成功',
                description: '笔记已删除',
                variant: "success"
            });
        } catch (error) {
            handleApiError(error, '删除笔记');
        } finally {
            updateState({ isModalOpen: false, isDeleting: false });
        }
    }, [item.id, user?.id, isSelected, router, onUpdateBooks]);

    // 处理标题更新
    const handleSubmitNewTitle = useCallback(async () => {
        const trimmedTitle = uiState.newTitle.trim();
        if (!trimmedTitle || !item.id) {
            toast({
                title: '操作失败',
                description: '笔记标题不能为空',
                variant: "destructive"
            });
            return;
        }

        try {
            await makeApiRequest('PATCH', `book/${item.id}?user_id=${user?.id}`, {
                title: trimmedTitle
            });

            updateState({ isEditing: false });
            onUpdateBooks();
            
            toast({
                title: '操作成功',
                description: '笔记标题已更新',
                variant: "success"
            });
        } catch (error) {
            handleApiError(error, '更新笔记标题');
        }
    }, [uiState.newTitle, item.id, user?.id, onUpdateBooks]);

    // 处理选择
    const handleSelect = useCallback((e: React.MouseEvent) => {
        if (item.children) {
            e.preventDefault();
            updateState({ isOpen: !uiState.isOpen });
            return;
        }

        if (!item.id || item.id === selectedItem || isRoutingRef.current) {
            return;
        }

        e.preventDefault();
        isRoutingRef.current = true;
        onSelect(item.id);

    }, [item.id, item.children, selectedItem, uiState.isOpen, onSelect]);

    // 清理函数
    const cleanup = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, []);

    // 自动聚焦
    useEffect(() => {
        if (uiState.isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [uiState.isEditing]);

    // 注册快捷键
    useEffect(() => {
        if (isSelected && item.id) {
            shortcutManager.register({
                command: 'DELETE_BOOK',
                key: SHORTCUTS.DELETE_CHAT,
                description: '删除笔记',
                handler: () => updateState({ isModalOpen: true }),
                condition: () => document.activeElement?.tagName !== 'INPUT'
            });

            return () => {
                shortcutManager.unregister('DELETE_BOOK');
            };
        }
    }, [isSelected, item.id, shortcutManager, updateState]);

    // 处理标题动画
    useEffect(() => {
        if (uiState.isEditing) {
            updateState({ 
                displayedTitle: item.label,
                newTitle: item.label 
            });
            previousTitleRef.current = item.label;
            return;
        }

        if (item.label !== previousTitleRef.current && !isRoutingRef.current) {
            let index = 0;
            const targetTitle = item.label;
            
            cleanup();
            
            intervalRef.current = setInterval(() => {
                updateState({
                    displayedTitle: targetTitle.substring(0, index)
                });
                index++;
                
                if (index > targetTitle.length) {
                    cleanup();
                    previousTitleRef.current = targetTitle;
                }
            }, CONSTANTS.ANIMATION.INTERVAL);
        }

        return cleanup;
    }, [item.label, uiState.isEditing, cleanup, updateState]);

    // 渲染子项
    const renderChildren = useCallback(() => (
        item.children?.map((child) => (
            <div key={child.id}>
                {child.children ? (
                    <BookItemComponent
                        item={child}
                        level={level + 1}
                        selectedItem={selectedItem}
                        onSelect={onSelect}
                        onUpdateBooks={onUpdateBooks}
                    />
                ) : (
                    <CustomButton
                        label={child.label}
                        href={child.href}
                        selected={selectedItem === child.label}
                        onClick={() => onSelect(child.label)}
                    />
                )}
            </div>
        ))
    ), [item.children, level, selectedItem, onSelect, onUpdateBooks]);

    return (
        <div className="relative max-w-[255px]">
            <ConfirmModal
                isOpen={uiState.isModalOpen}
                onClose={() => updateState({ isModalOpen: false })}
                onConfirm={handleConfirmDelete}
                title="删除笔记"
                message={`您确定要删除笔记 "${item.label}" 吗?`}
                type="danger"
                confirmText="删除"
                isLoading={uiState.isDeleting}
            />
            
            <div className="relative w-full px-3">
                {uiState.isEditing ? (
                    <div className={`text-sm mt-1 flex items-center space-x-2 rounded-md py-2 px-2 bg-[#f0f0f0] dark:bg-gray-850 text-black dark:text-white w-full`}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={uiState.newTitle}
                            onChange={(e) => updateState({ newTitle: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmitNewTitle();
                                if (e.key === 'Escape') updateState({ isEditing: false });
                            }}
                            placeholder="请输入笔记标题"
                            className="flex-grow bg-transparent focus:outline-none text-black dark:text-white"
                        />
                        <Check
                            size={18}
                            className="cursor-pointer text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white"
                            onClick={handleSubmitNewTitle}
                        />
                        <X
                            size={18}
                            className="cursor-pointer text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white"
                            onClick={() => updateState({ isEditing: false })}
                        />
                    </div>
                ) : (
                    <Link 
                        href={{ pathname: `/book/${item.id}` }}
                        prefetch={false}
                        scroll={false}
                        replace={true}
                        onClick={(e) => {
                            if ((e.target as HTMLElement).closest('.more-options-button')) {
                                e.preventDefault();
                                return;
                            }
                            handleSelect(e);
                        }}
                        className="w-full"
                    >
                        <button
                            ref={buttonRef}
                            onMouseEnter={() => updateState({ hover: true })}
                            onMouseLeave={() => updateState({ hover: false })}
                            className={`mt-1 flex items-center space-x-2 rounded-md py-2 px-2 transition-colors duration-200 w-full text-left ${
                                level > 0 ? 'pl-4' : ''
                            } text-black dark:text-white ${
                                isSelected ? 'bg-[#f0f0f0] dark:bg-[#1e1e1e]' : 'hover:bg-[#f0f0f0]/75 dark:hover:bg-[#1e1e1e]/75'
                            }`}
                        >
                            {item.icon && (
                                <span className="text-black dark:text-white">
                                    {item.icon}
                                </span>
                            )}
                            {item.children && (
                                <span className="text-black dark:text-white">
                                    {uiState.isOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                                </span>
                            )}
                            <span className="text-sm flex-grow truncate">
                                {uiState.displayedTitle}
                            </span>
                            {(isSelected || uiState.hover) && (
                                <span
                                    className="ml-auto more-options-button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateState({ menuOpen: !uiState.menuOpen });
                                    }}
                                >
                                    <MoreHorizontal size={16} className="text-black dark:text-white"/>
                                </span>
                            )}
                        </button>
                    </Link>
                )}
            </div>

            {uiState.menuOpen && (
                <DropDownMenu 
                    isOpen={uiState.menuOpen}
                    onClose={() => updateState({ menuOpen: false })}
                    menuItems={menuItems}
                    placement={'right'}
                    referenceElement={buttonRef.current}
                />
            )}

            {item.children && (
                <div
                    className={`ml-1 overflow-hidden ${CONSTANTS.ANIMATION.TRANSITION.enter} ${
                        uiState.isOpen ? CONSTANTS.ANIMATION.TRANSITION.enterTo : CONSTANTS.ANIMATION.TRANSITION.enterFrom
                    }`}
                >
                    {uiState.isOpen && renderChildren()}
                </div>
            )}
        </div>
    );
});

BookItemComponent.displayName = 'BookItemComponent';

export default BookItemComponent;