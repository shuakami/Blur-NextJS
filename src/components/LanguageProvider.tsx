"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Cookies from 'js-cookie';
import { motion } from 'framer-motion'; // 引入 Framer Motion

interface Language {
    [key: string]: string;
}

interface TranslationContextProps {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
    defaultLanguage?: string;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, defaultLanguage = 'en' }) => {
    const [language, setLanguageState] = useState<string>(defaultLanguage);
    const [translations, setTranslations] = useState<Language>({});
    const [isLoading, setIsLoading] = useState<boolean>(false); // 增加加载状态
    const router = useRouter();

    // Load language preference from cookies on initial load
    useEffect(() => {
        const storedLang = Cookies.get('NEXT_LOCALE');
        if (storedLang) {
            setLanguageState(storedLang);
        }
    }, []);

    // Load translations whenever language changes
    useEffect(() => {
        const loadTranslations = async (lang: string) => {
            setIsLoading(true); // 设置为加载中
            try {
                const response = await fetch(`/locales/${lang}/common.json`);
                if (!response.ok) {
                    throw new Error('Failed to load translations');
                }
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false); // 加载完成
            }
        };

        loadTranslations(language);
    }, [language]);

    const t = (key: string) => {
        return translations[key] || key;
    };

    const setLanguage = (lang: string) => {
        setLanguageState(lang);
        Cookies.set('NEXT_LOCALE', lang, { expires: 365 }); // 保存语言偏好到 cookie，有效期为 1 年
    };

    return (
        <TranslationContext.Provider value={{ language, setLanguage, t }}>
            {/* 包裹动画效果 */}
            <motion.div
                initial={{ opacity: 0 }} // 动画初始状态
                animate={{ opacity: 1 }}  // 动画结束状态
                exit={{ opacity: 0 }}     // 动画结束状态
                transition={{ duration: 0.8 }} // 过渡时间
            >
                {children}
            </motion.div>
        </TranslationContext.Provider>
    );
};

export const useTranslationContext = (): TranslationContextProps => {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslationContext must be used within a LanguageProvider');
    }
    return context;
};
