"use client";

import React, {useState, useEffect, useRef, memo, useCallback, useMemo} from 'react';
import {
    ChevronRight,
    ChevronDown,
    MoreHorizontal,
    Check,
    X,
    PencilLine,
    MessageCircleX,
} from 'lucide-react';
import {SidebarItem} from './types';
import CustomButton from './CustomButton';
import DropDownMenu from "@/components/ui/tofu/dropdown-menu";
import {useUser} from '@clerk/nextjs';
import {deleteConversation, updateConversationTitle} from "@/app/[对话管理]/api";
import {toast} from "@/hooks/use-toast";
import ConfirmModal from "@/components/ui/tofu/confirm-modal";
import {useRouter} from 'next/navigation';
import { useConversations } from '../../../../contexts/ConversationsContext';
import Link from 'next/link';

const TRANSITION_CLASSES = {
    enter: 'transition-[height] duration-200 ease-out',
    enterFrom: 'h-0',
    enterTo: 'h-auto',
    leave: 'transition-[height] duration-200 ease-in',
    leaveFrom: 'h-auto',
    leaveTo: 'h-0'
};

interface SidebarItemComponentProps {
    item: SidebarItem;
    level: number;
    selectedItem: string | null;
    onSelect: (label: string) => void;
    onUpdateConversations: () => void; // 新增: 用于刷新侧边栏数据
}

// 使用 memo 优化组件
const SidebarItemComponent = memo<SidebarItemComponentProps>(({
    item,
    level,
    selectedItem,
    onSelect,
    onUpdateConversations
}) => {
    const {user} = useUser(); // 获取用户 ID
    const router = useRouter(); // 用于导航
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [menuOpen, setMenuOpen] = useState<boolean>(false); // 控制菜单是否打开
    const [isEditing, setIsEditing] = useState<boolean>(false); // 是否处于编辑标题状态
    const [newTitle, setNewTitle] = useState<string>(item.label); // 存储新的标题
    const [hover, setHover] = useState<boolean>(false); // 控制hover状态
    const inputRef = useRef<HTMLInputElement>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // 控制模态框的打开状态
    const { removeConversation, updateConversationTitle: updateTitle } = useConversations();

    const toggleOpen = useCallback(() => setIsOpen(!isOpen), [isOpen]);
    const isSelected = selectedItem === item.id;

    const buttonRef = useRef<HTMLButtonElement>(null);

    // 处理菜单关闭
    const handleCloseMenu = useCallback(() => setMenuOpen(false), []);

    // 自动聚焦
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleConfirmDelete = useCallback(async () => {
        if (!item.id) return;
        
        // 关闭模态框
        setIsModalOpen(false);
        try {
            // 删除指定的对话
            await deleteConversation(item.id, user?.id || '');
            
            // 如果当前对话被选中，重定向到首页
            if (isSelected) {
                router.push('/?new=true');
            }
            // 从会话列表中移除该对话
            removeConversation(item.id);
            
            // 显示成功提示
            toast({
                title: '操作成功',
                description: '对话已删除',
                variant: "success"
            });
        } catch (e) {
            // 更新会话列表
            onUpdateConversations();
            // 显示失败提示
            toast({
                title: '操作失败',
                description: '对话删除失败',
                variant: "destructive"
            });
        }
    }, [item.id, user?.id, isSelected, router, removeConversation, onUpdateConversations]);

    const menuItems = useMemo(() => [
        {
            id: 'update-title',
            text: '更改对话标题',
            icon: PencilLine,
            onClick: () => {
                setIsEditing(true);
                setMenuOpen(false);
            },
        },
        {
            id: 'delete-conversation',
            text: '删除对话',
            icon: MessageCircleX,
            isDanger: true,
            onClick: () => {
                setIsModalOpen(true);
                setMenuOpen(false);
            },
        },
    ], []);

    // 提交新标题的处理函数
    const handleSubmitNewTitle = useCallback(async () => {
        const trimmedTitle = newTitle.trim();
        // 检查标题和对话ID是否有效
        if (!trimmedTitle || !item.id) {
            toast({
                title: '操作失败',
                description: '对话标题不能为空',
                variant: "destructive"
            });
            return;
        }

        try {
            // 更新本地状态中的标题
            updateTitle(item.id, trimmedTitle);
            // 更新服务器上的对话标题
            await updateConversationTitle(item.id, trimmedTitle, user?.id || '');
            // 结束编辑模式
            setIsEditing(false);
            
            toast({
                title: '操作成功',
                description: '对话标题已更新',
                variant: "success"
            });
        } catch (e) {
            onUpdateConversations();
            toast({
                title: '操作失败',
                description: '对话标题更新失败',
                variant: "destructive"
            });
        }
    }, [newTitle, item.id, updateTitle, user?.id, onUpdateConversations]);

    // 优化子项渲染
    const renderChildren = useCallback(() => (
        item.children?.map((child) => (
            <div key={child.id}>
                {child.children ? (
                    <SidebarItemComponent
                        item={child}
                        level={level + 1}
                        selectedItem={selectedItem}
                        onSelect={onSelect}
                        onUpdateConversations={onUpdateConversations}
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
    ), [item.children, level, selectedItem, onSelect, onUpdateConversations]);

    return (
        <div className="relative">
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="删除对话"
                message={`您确定要删除 "${item.label}" 吗?`}
            />
            
            {/* 编辑模式或显示模式 */}
            <div className="flex items-center">
                {isEditing ? (
                    <div className={`mx-3 text-sm mt-1 flex items-center space-x-2 rounded-md py-2 px-3 bg-[#f0f0f0] dark:bg-gray-850 text-black dark:text-white`}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmitNewTitle();
                                if (e.key === 'Escape') setIsEditing(false);
                            }}
                            className="flex-grow bg-transparent focus:outline-none text-black dark:text-white max-w-[120px]"
                        />
                        <Check size={18}
                               className="cursor-pointer text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white"
                               onClick={handleSubmitNewTitle}/>
                        <X size={18}
                           className="cursor-pointer text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white"
                           onClick={() => setIsEditing(false)}/>
                    </div>
                ) : (
                    <Link 
                        href={`/chat/${item.id}`} 
                        prefetch={false}
                        onClick={(e) => {
                            if ((e.target as HTMLElement).closest('.more-options-button')) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <button
                            ref={buttonRef}
                            onClick={(e) => {
                                if (item.children) {
                                    e.preventDefault();
                                    toggleOpen();
                                } else {
                                    onSelect(item.id ?? '');
                                }
                            }}
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            className={`mt-1 flex items-center space-x-2 rounded-md mx-3 py-2 px-3 transition-colors duration-200 w-[185px] text-left ${
                                level > 0 ? 'pl-4' : ''
                            } text-black dark:text-white ${
                                isSelected ? 'bg-[#f0f0f0] dark:bg-[#1e1e1e]' : 'hover:bg-[#f0f0f0]/75 dark:hover:bg-[#1e1e1e]/75'
                            }`}
                        >
                            {item.icon && <span className="text-black dark:text-white">{item.icon}</span>}
                            {item.children && (
                                <span className="text-black dark:text-white">
                                    {isOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                                </span>
                            )}
                            <span className="text-sm flex-grow">{item.label}</span>

                            {(isSelected || hover) && (
                                <span
                                    className="ml-auto more-options-button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setMenuOpen(!menuOpen);
                                    }}
                                >
                                    <MoreHorizontal size={16} className="text-black dark:text-white"/>
                                </span>
                            )}
                        </button>
                    </Link>
                )}
            </div>

            {/* 下拉菜单 */}
            {menuOpen && (
                <DropDownMenu 
                    isOpen={menuOpen} 
                    onClose={handleCloseMenu} 
                    menuItems={menuItems} 
                    placement={'right'}
                    referenceElement={buttonRef.current}
                />
            )}

            {/* 子项渲染 */}
            {item.children && (
                <div
                    className={`ml-1 overflow-hidden ${TRANSITION_CLASSES.enter} ${
                        isOpen ? TRANSITION_CLASSES.enterTo : TRANSITION_CLASSES.enterFrom
                    }`}
                >
                    {isOpen && renderChildren()}
                </div>
            )}
        </div>
    );
});

SidebarItemComponent.displayName = 'SidebarItemComponent';

export default SidebarItemComponent;
