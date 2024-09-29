// src/components/Sidebar.tsx
"use client"

import {User, CreditCard, Bell, Shield, HelpCircle, LogOut} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useAuth} from "@clerk/nextjs";
import {toast} from "@/hooks/use-toast";
import {useState} from "react";
import useTranslation from "@/hooks/useTranslation";

interface SidebarProps {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export const Sidebar: React.FC<SidebarProps> = ({activeTab, setActiveTab}) => {
    const {t} = useTranslation();
    const {signOut} = useAuth();
    const [signOutTextKey, setSignOutTextKey] = useState("退出登录"); // 初始状态为退出登录
    const [isConfirming, setIsConfirming] = useState(false); // 管理是否在确认退出

    const menuItems = [
        {id: "profile", icon: User, label: t("个人资料"), href: "/profile"},
        {id: "subscription", icon: CreditCard, label: t("订阅管理"), href: "/subscription"},
        {id: "notifications", icon: Bell, label: t("通知设置"), href: "/notifications"},
        {id: "security", icon: Shield, label: t("安全设置"), href: "/security"},
        {id: "help", icon: HelpCircle, label: t("帮助中心"), href: "/help"},
    ];

    const handleSignOut = async () => {
        if (isConfirming) {
            // 用户已经确认，再次点击时登出
            await signOut();
            toast({
                title: t("操作成功"),
                description: t("已安全退出"),
                variant: "success",
            });
        } else {
            // 第一次点击提示确认退出
            setSignOutTextKey("确定退出？");
            setIsConfirming(true);
            toast({
                title: t("警告"),
                description: t("真的确定要退出登录？"),
                variant: "warning",
            });

            // 如果用户在 5 秒内没有点击第二次，恢复初始状态
            setTimeout(() => {
                setSignOutTextKey("退出登录");
                setIsConfirming(false);
            }, 5000); // 5 秒倒计时
        }
    };

    return (
        <div
            className="p-2 w-64 flex flex-col border-r border-r-gray-100 dark:border-r-gray-900 bg-muted/30 py-6 px-2 space-x-1.5">
            <div className="mb-6 px-6 mt-5">
                <h1 className="text-3xl font-semibold">{t("个人中心")}</h1>
                <p className="text-sm-md text-muted-foreground mt-1.5">{t("管理您的账户和偏好设置")}</p>
            </div>
            <nav className="flex-grow space-y-2 px-1">
                {menuItems.map((item) => (
                    <Button
                        key={item.id}
                        variant={activeTab === item.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveTab(item.id)}
                    >
                        <item.icon className="mr-3 h-4 w-4"/>
                        <span className="text-sm mt-0.5">{item.label}</span>
                    </Button>
                ))}
            </nav>
            <div className="mt-auto px-2">
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-3 h-4 w-4"/>
                    <span className="text-sm">{t(signOutTextKey)}</span>
                </Button>
            </div>
        </div>
    );
};
