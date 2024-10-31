"use client";

import {useUser, useAuth} from "@clerk/nextjs";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useEffect, useState, useRef} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import SettingsModal from "@/app/[设置]/settings_modal";
import DropDownMenu from "@/components/ui/tofu/dropdown-menu";
import PersonalCenter from "@/app/[个人中心]";
import {LogOut, SettingsIcon, UserRound} from "lucide-react";


export default function UserAvatar() {
    const {user} = useUser();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 控制设置模态框的状态
    const [isMenuOpen, setIsMenuOpen] = useState(false); // 控制下拉菜单的状态
    const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
    const avatarRef = useRef<HTMLButtonElement>(null); // 用于 DropDownMenu 定位
    const router = useRouter();
    const searchParams = useSearchParams();
    const {signOut} = useAuth();

    // 获取用户头像的 URL，如果没有则为 null
    const avatarUrl = user?.imageUrl;

    // 当 URL 包含 `?settings=open` 时，打开设置模态框 / 包含 `?account=open` 时，打开账户设置模态框
    useEffect(() => {
        if (searchParams?.get("settings") === "open") {
            openSettings();
        }
        if (searchParams?.get("account") === "open") {
            openAccountSettings();
        }
    }, [searchParams]);

    // 打开设置模态框并将 `?settings=open` 添加到 URL
    const openSettings = () => {
        setIsSettingsOpen(true);
        const currentSearchParams = new URLSearchParams(window.location.search);
        currentSearchParams.set("settings", "open");
        router.push(`${window.location.pathname}?${currentSearchParams.toString()}`);
    };

    // 关闭设置模态框并从 URL 中移除所有参数
    const closeSettings = () => {
        setIsSettingsOpen(false);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("account");
        newUrl.searchParams.delete("tab");
        newUrl.searchParams.delete("settings");
        router.push(newUrl.toString());
    };


    // 打开账户设置模态框
    const openAccountSettings = () => {
        setIsAccountSettingsOpen(true);
        const currentSearchParams = new URLSearchParams(window.location.search);
        currentSearchParams.set("account", "open");
        router.push(`${window.location.pathname}?${currentSearchParams.toString()}`);
    };

    const closeAccountSettings = () => {
        setIsAccountSettingsOpen(false);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("account");
        newUrl.searchParams.delete("tab");
        newUrl.searchParams.delete("settings");
        router.push(newUrl.toString());
    };

    // 菜单项
    const menuItems = [
        {
            id: "settings",
            text: "设置",
            icon: SettingsIcon,
            onClick: () => {
                setIsMenuOpen(false);
                setIsAccountSettingsOpen(false)
                openSettings(); // 打开设置模态框
            },
        },
        {
            id: "account",
            text: "账户设置",
            icon: UserRound,
            onClick: () => {
                setIsMenuOpen(false);
                setIsAccountSettingsOpen(false)
                openAccountSettings();
            },
        },
        {
            id: "logout",
            text: "退出登录",
            icon: LogOut,
            onClick: () => {
                setIsMenuOpen(false);
                setIsAccountSettingsOpen(false)
                signOut();
            },
            isDanger: true,
            isSpecial: true
        },
    ];

    return (
        <>
            {/* 用户头像，点击时打开下拉菜单 */}

            <Avatar ref={avatarRef} onClick={() => setIsMenuOpen(true)}>
                {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="User avatar" className="h-9 w-9 cursor-pointer
                    hover:ring-[3px] hover:ring-gray-250 dark:hover:ring-gray-850/70
                    transition-all duration-200 ease-in-out rounded-full"/>
                ) : (
                    <AvatarFallback className="cursor-pointer">NL</AvatarFallback>
                )}
            </Avatar>


            {/* 下拉菜单 */}
            <DropDownMenu
                referenceElement={avatarRef.current} // 定位菜单到头像旁边
                isOpen={isMenuOpen}
                menuItems={menuItems}
                placement={'bottom'}
                onClose={() => setIsMenuOpen(false)} // 点击外部区域关闭菜单
            />

            {/* 设置模态框 */}
            <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings}/>

            {/* 账户设置模态框 */}
            <PersonalCenter isOpen={isAccountSettingsOpen} onClose={closeAccountSettings}/>
        </>
    );
}
