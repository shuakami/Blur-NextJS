"use client";

import {
    BookIcon,
    ChevronDown,
    HelpCircle,
    Home,
    LanguagesIcon,
    Activity
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import LanguageDropdown from "@/app/[语言选择器]/language-dropdown";
import AuthMethodsWrapper from "./AuthMethodsWrapper";
import Meta from "@/components/ui/Meta";
import useTranslation from "@/hooks/useTranslation";
import { defaultLanguages } from "@/lib/languages";
import { MenuItems, MenuItem } from "@/components/ui/dropdown-menu";

interface AuthPageProps {
    mode?: 'login' | 'register';
}

export default function AuthPage({ mode = 'login' }: AuthPageProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { language, t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const helpButtonRef = useRef<HTMLButtonElement>(null);
    const langButtonRef = useRef<HTMLButtonElement>(null);
    
    const getLanguageName = useCallback((code: string) => {
        const lang = defaultLanguages.find((lang) => lang.code === code);
        return lang ? lang.name : code;
    }, []);
    
    const helpMenuItems = [
        {
            id: 'docs',
            text: t('使用教程'),
            href: 'https://docs.blur-ai.tech',
            icon: BookIcon,
            target: '_blank'
        },
        {
            id: 'status',
            text: t('运行状态'),
            icon: Activity,
            href: 'https://status.blur-ai.tech',
            target: '_blank'
        },
        {
            id: 'home',
            text: t('回到首页'),
            href: '/',
            icon: Home,
            target: '_self',
            isSpecial: true
        },
    ];

    return (
        <AuthGuard>
            <Meta pageName={mode === 'login' ? t('登录') : t('注册')}/>
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
                {/* 头部帮助按钮 */}
                <header className="fixed top-0 right-0 p-4">
                    <div className="relative">
                        <button
                            ref={helpButtonRef}
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 
                                     dark:text-neutral-500 dark:hover:text-neutral-300 
                                     hover:bg-neutral-100 dark:hover:bg-neutral-800
                                     transition-colors"
                        >
                            <HelpCircle className="h-5 w-5" />
                        </button>
                        <MenuItems
                            isOpen={menuOpen}
                            onClose={() => setMenuOpen(false)}
                            referenceElement={helpButtonRef.current}
                            className="w-[240px]"
                            mobileHeader={{
                                title: t('帮助')
                            }}
                        >
                            {helpMenuItems.map((item) => (
                                <MenuItem
                                    key={item.id}
                                    icon={item.icon}
                                    onClick={() => {
                                        window.open(item.href, item.target);
                                        setMenuOpen(false);
                                    }}
                                >
                                    {item.text}
                                </MenuItem>
                            ))}
                        </MenuItems>
                    </div>
                </header>

                {/* 主要内容区域 */}
                <main className="flex-grow flex items-center justify-center px-6 py-16">
                    <div className="w-full max-w-sm">
                        <AuthMethodsWrapper mode={mode} />
                    </div>
                </main>

                {/* 底部语言选择器 */}
                <footer className="fixed bottom-0 right-0 p-4">
                    <button
                        ref={langButtonRef}
                        className="flex items-center space-x-2 text-sm text-neutral-500 
                                 dark:text-neutral-400 hover:text-neutral-700 
                                 dark:hover:text-neutral-200 transition-colors"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <LanguagesIcon className="w-4 h-4" />
                        <span>{getLanguageName(language)}</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <LanguageDropdown
                        isOpen={isDropdownOpen}
                        onClose={() => setIsDropdownOpen(false)}
                        referenceElement={langButtonRef.current}
                    />
                </footer>
            </div>
        </AuthGuard>
    );
}