"use client";

import {Paintbrush, Bell, Globe, Shield, Plug, HelpCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import useTranslation from "@/hooks/useTranslation";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";

interface SidebarProps {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    isMobile?: boolean;
}

export const SettingsSidebar: React.FC<SidebarProps> = ({activeTab, setActiveTab, isMobile}) => {
    const {t} = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 定义设置侧边栏的选项
    const menuItems = [
        {id: "appearance", icon: Paintbrush, label: t("外观设置"), href: "/?tab=appearance"},
        {id: "notifications", icon: Bell, label: t("通知设置"), href: "/?tab=notifications"},
        {id: "language", icon: Globe, label: t("语言设置"), href: "/?tab=language"},
        {id: "privacy", icon: Shield, label: t("隐私设置"), href: "/?tab=privacy"},
        {id: "integration", icon: Plug, label: t("应用集成"), href: "/?tab=integration"},
        {id: "help", icon: HelpCircle, label: t("关于Blur"), href: "/?tab=help"},
    ];

    // 根据 URL 中的 tab 参数设置 activeTab
    useEffect(() => {
        const currentTab = searchParams?.get('tab');
        if (currentTab) {
            setActiveTab(currentTab);
        }
    }, [searchParams, setActiveTab]);

    return (
        <div className={`h-full flex flex-col bg-muted/30 
            ${isMobile ? 'pt-14' : 'py-6'} px-2.5
            ${!isMobile && 'border-r border-r-gray-100 dark:border-r-gray-900'}`}
        >
            <div className="mb-6 px-6 mt-5">
                <h1 className="text-2xl font-semibold">{t("设置中心")}</h1>
                <p className="text-sm-md text-muted-foreground mt-1.5">{t("管理应用偏好和设置")}</p>
            </div>
            <nav className="flex-grow space-y-2 px-1">
                {menuItems.map((item) => (
                    <Button
                        key={item.id}
                        variant={activeTab === item.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                            setActiveTab(item.id);
                            const currentSearchParams = new URLSearchParams(window.location.search);
                            currentSearchParams.set('tab', item.id);
                            router.push(
                                `${window.location.pathname}?${currentSearchParams.toString()}` as any
                            );
                            if (isMobile) {
                                setIsMobileMenuOpen(false);
                            }
                        }}
                    >
                        <item.icon className="mr-3 h-4 w-4"/>
                        <span className="text-sm mt-0.5">{item.label}</span>
                    </Button>
                ))}
            </nav>
        </div>
    );
};
