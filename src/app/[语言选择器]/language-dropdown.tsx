// /components/LanguageDropdown.tsx

"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import useTranslation from "@/hooks/useTranslation"; // 引入 useTranslation hook
import { defaultLanguages, Language } from "@/lib/languages";
import {toast} from "@/hooks/use-toast"; // 导入语言列表

interface LanguageDropdownProps {
    direction?: "up" | "down";
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
                                                               direction = "down",
                                                               setIsOpen,
                                                           }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { setLanguage, t } = useTranslation(); // 获取 setLanguage 和 t

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                // 点击外部时，仅关闭菜单，不更改已选语言
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setIsOpen]);

    const handleLanguageSelect = (language: Language) => {
        setLanguage(language.code); // 更新语言状态
        setIsOpen(false); // 关闭菜单
        toast({
            title: t("已切换语言至 "+language.name)
        });
    };

    return (
        <motion.div
            ref={dropdownRef}
            className="relative inline-block text-left"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <div
                className={`absolute ${
                    direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
                } left-0 w-auto max-w-[330px] rounded-md shadow-lg bg-white dark:bg-[#1f1f1f] ring-1 ring-black ring-opacity-5 z-50`}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="language-menu"
            >
                <div className="py-1 max-h-[340px] overflow-y-auto">
                    {defaultLanguages.map((language, index) => (
                        <div
                            key={index}
                            role="menuitem"
                            tabIndex={-1}
                            className="cursor-pointer select-none mx-1 rounded-md hover:bg-[#F3F3F3]/80 dark:hover:bg-[#2e2e2e]"
                            onClick={() => handleLanguageSelect(language)}
                        >
                            <div className="flex items-center px-3 py-2">
                                <div className="flex-grow min-w-0">
                                    <p className="text-xs font-medium text-[#1f1f1f] dark:text-[#f5f5f5] truncate">
                                        {language.name}
                                    </p>
                                    <p className="text-xs text-[#5a5a5a] dark:text-[#cfcfcf] truncate">
                                        {t(language.translationKey)}
                                    </p>
                                </div>
                                {language.beta && (
                                    <span className="inline-flex items-center px-1 py-0.5 rounded text-ss font-medium bg-[#e0e0e0] dark:bg-[#2e2e2e] text-[#5a5a5a] dark:text-[#cfcfcf]">
                                        {t("测试版")}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default LanguageDropdown;
