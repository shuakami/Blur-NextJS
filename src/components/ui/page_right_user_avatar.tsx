"use client";

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DropDownMenu from "@/components/ui/tofu/dropdown-menu";
import dynamic from 'next/dynamic';
import { LogOut, SettingsIcon, UserRound } from "lucide-react";

// 模态框组件
const SettingsModal = dynamic(() => import("@/app/[设置]/settings_modal"), {
    loading: () => null,
    ssr: false
});
const PersonalCenter = dynamic(() => import("@/app/[个人中心]"), {
    loading: () => null,
    ssr: false
});

// 菜单项
const createMenuItems = (handlers: {
    openSettings: () => void,
    openAccountSettings: () => void,
    signOut: () => void,
    closeMenu: () => void
}) => [
    {
        id: "settings",
        text: "设置",
        icon: SettingsIcon,
        onClick: () => {
            handlers.closeMenu();
            handlers.openSettings();
        },
    },
    {
        id: "account",
        text: "账户设置",
        icon: UserRound,
        onClick: () => {
            handlers.closeMenu();
            handlers.openAccountSettings();
        },
    },
    {
        id: "logout",
        text: "退出登录",
        icon: LogOut,
        onClick: () => {
            handlers.closeMenu();
            handlers.signOut();
        },
        isDanger: true,
        isSpecial: true
    },
];

const UserAvatar = memo(() => {
    const { user } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const avatarRef = useRef<HTMLButtonElement>(null);
    
    const [modals, setModals] = useState({
        settings: false,
        account: false,
        menu: false
    });

    // URL 参数处理
    useEffect(() => {
        setModals(prev => ({
            ...prev,
            settings: searchParams?.get("settings") === "open",
            account: searchParams?.get("account") === "open"
        }));
    }, [searchParams]);

    // URL 更新处理器
    const updateURL = useCallback((params: { [key: string]: string | null }) => {
        const newUrl = new URL(window.location.href);
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) {
                newUrl.searchParams.delete(key);
            } else {
                newUrl.searchParams.set(key, value);
            }
        });
        router.push(newUrl.toString() as any);
    }, [router]);

    // 模态框处理器
    const modalHandlers = {
        openSettings: useCallback(() => {
            setModals(prev => ({ ...prev, settings: true }));
            updateURL({ settings: "open" });
        }, [updateURL]),

        closeSettings: useCallback(() => {
            setModals(prev => ({ ...prev, settings: false }));
            updateURL({ settings: null, account: null, tab: null });
        }, [updateURL]),

        openAccountSettings: useCallback(() => {
            setModals(prev => ({ ...prev, account: true }));
            updateURL({ account: "open" });
        }, [updateURL]),

        closeAccountSettings: useCallback(() => {
            setModals(prev => ({ ...prev, account: false }));
            updateURL({ account: null, tab: null, settings: null });
        }, [updateURL])
    };

    // 菜单项配置
    const menuItems = createMenuItems({
        openSettings: modalHandlers.openSettings,
        openAccountSettings: modalHandlers.openAccountSettings,
        signOut,
        closeMenu: () => setModals(prev => ({ ...prev, menu: false }))
    });

    return (
        <>
            <Avatar 
                ref={avatarRef} 
                onClick={() => setModals(prev => ({ ...prev, menu: true }))}
            >
                {user?.imageUrl ? (
                    <AvatarImage 
                        src={user.imageUrl} 
                        alt="User avatar" 
                        className="h-9 w-9 cursor-pointer hover:ring-[3px] hover:ring-gray-250 
                                 dark:hover:ring-gray-850/70 transition-all duration-200 
                                 ease-in-out rounded-full"
                    />
                ) : (
                    <AvatarFallback className="cursor-pointer">
                        {user?.fullName?.[0] || 'NL'}
                    </AvatarFallback>
                )}
            </Avatar>

            <DropDownMenu
                referenceElement={avatarRef.current}
                isOpen={modals.menu}
                menuItems={menuItems}
                placement="bottom"
                onClose={() => setModals(prev => ({ ...prev, menu: false }))}
            />

            {modals.settings && (
                <SettingsModal 
                    isOpen={modals.settings} 
                    onClose={modalHandlers.closeSettings}
                />
            )}

            {modals.account && (
                <PersonalCenter 
                    isOpen={modals.account} 
                    onClose={modalHandlers.closeAccountSettings}
                />
            )}
        </>
    );
});

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
