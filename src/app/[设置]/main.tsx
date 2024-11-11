import React, {useEffect, useRef} from "react";
import {ThemeSettings} from "@/app/[设置]/theme/theme_settings";
import {ColorThemeSettings} from "@/app/[设置]/theme/color_settings";
import {FontSizeSettings} from "@/app/[设置]/theme/font_size";
import {LanguageSettings} from "@/app/[设置]/language_settings";
import {NotificationSettings} from "@/app/[设置]/notification_settings";
import {PrivacySettings} from "@/app/[设置]/privacy_setting";
import AboutBlur from "@/app/[设置]/about";
import {useSearchParams} from "next/navigation";

interface SettingsMainProps {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export const SettingsMain: React.FC<SettingsMainProps> = ({activeTab, setActiveTab}) => {
    const searchParams = useSearchParams(); // 获取查询参数

    // 为每个设置部分创建 ref
    const appearanceRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const languageRef = useRef<HTMLDivElement>(null);
    const privacyRef = useRef<HTMLDivElement>(null);
    const integrationRef = useRef<HTMLDivElement>(null);
    const helpRef = useRef<HTMLDivElement>(null);

    // 滚动到指定部分
    const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>) => {
        sectionRef.current?.scrollIntoView({behavior: "smooth"});
    };

    // 根据 URL 中的 `tab` 参数自动滚动到对应的部分
    useEffect(() => {
        const tab = searchParams?.get('tab'); // 从 URL 中读取 `tab` 参数
        switch (tab) {
            case "appearance":
                scrollToSection(appearanceRef);
                setActiveTab("appearance");
                break;
            case "notifications":
                scrollToSection(notificationsRef);
                setActiveTab("notifications");
                break;
            case "language":
                scrollToSection(languageRef);
                setActiveTab("language");
                break;
            case "privacy":
                scrollToSection(privacyRef);
                setActiveTab("privacy");
                break;
            case "integration":
                scrollToSection(integrationRef);
                setActiveTab("integration");
                break;
            case "help":
                scrollToSection(helpRef);
                setActiveTab("help");
                break;
            default:
                break;
        }
    }, [searchParams, setActiveTab]);

    // 当 activeTab 改变时，滚动到相应的部分
    useEffect(() => {
        switch (activeTab) {
            case "appearance":
                scrollToSection(appearanceRef);
                break;
            case "notifications":
                scrollToSection(notificationsRef);
                break;
            case "language":
                scrollToSection(languageRef);
                break;
            case "privacy":
                scrollToSection(privacyRef);
                break;
            case "integration":
                scrollToSection(integrationRef);
                break;
            case "help":
                scrollToSection(helpRef);
                break;
            default:
                scrollToSection(appearanceRef);
                break;
        }
    }, [activeTab]);

    return (
        <div className="flex-col h-full overflow-auto w-full space-y-10">
            <div ref={appearanceRef}>
                <ThemeSettings/>
                <ColorThemeSettings/>
                <FontSizeSettings/>
            </div>
            <div ref={notificationsRef}>
                <NotificationSettings/>
            </div>
            <div ref={languageRef}>
                <LanguageSettings/>
            </div>
            <div ref={privacyRef}>
                <PrivacySettings/>
            </div>
            <div ref={helpRef}>
                <AboutBlur/>
            </div>
        </div>
    );
};
