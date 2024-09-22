"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, HelpCircle, LanguagesIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import LanguageDropdown from "@/app/[语言选择器]/language-dropdown";
import useTranslation from "@/hooks/useTranslation";
import { defaultLanguages } from "@/lib/languages";
import {Input} from "@/components/ui/input";
import {motion} from "framer-motion";

export default function LoginPage() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { language, t } = useTranslation();

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const getLanguageName = (code: string) => {
        const lang = defaultLanguages.find((lang) => lang.code === code);
        return lang ? lang.name : code;
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#fffefb] dark:bg-[#181818] text-[#040404] dark:text-[#f5f5f5] font-sans overflow-auto">
            {/* 左侧展示图片部分 */}
            <div className="hidden lg:block w-1/2 relative">
                <Image
                    src="/background.png"
                    alt="Showcase"
                    fill
                    style={{ objectFit: "cover" }}
                    quality={100}
                    className="dark:opacity-80"
                />
            </div>

            {/* 右侧登录表单部分 */}
            <div className="flex flex-col w-full lg:w-1/2 p-8 lg:p-16 justify-between">
                <header className="flex justify-end">
                    <Button variant="ghost" size="icon" className="text-[#c7c6c4] dark:text-[#9e9e9e]">
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                </header>

                <main className="flex-grow flex flex-col justify-center max-w-[420px] mx-auto w-full lg:w-auto">
                    <h1 className="text-2xl font-semibold mb-2 leading-tight">
                        {t("春风拂柳绿，明月照花新。")}
                    </h1>
                    <p className="text-[#acaba9] dark:text-[#b3b3b3] text-xl mb-8 leading-tight">
                        {t("登录你的 Blur 帐号")}
                    </p>

                    <Button
                        variant="outline"
                        className="w-full mb-3 justify-center text-sm font-normal h-10 bg-transparent dark:bg-[#333333] dark:border-[#666666]"
                    >
                        <svg viewBox="0 0 18 18" className="w-4 h-4 mr-2">
                            <path
                                fill="#4285F4"
                                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                            />
                            <path
                                fill="#34A853"
                                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
                            />
                            <path
                                fill="#EA4335"
                                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                            />
                        </svg>
                        {t("Google 登录")}
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full mb-3 justify-center text-sm font-normal h-10 bg-transparent dark:bg-[#333333] dark:border-[#666666]"
                    >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                            <path
                                d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z"></path>
                        </svg>
                        {t("Github 登录")}
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full mb-8 justify-center text-sm font-normal h-10 bg-transparent dark:bg-[#333333] dark:border-[#666666]"
                    >
                        <svg role="graphics-symbol" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                            <path
                                d="M14.757 4A5.724 5.724 0 009 9.748c0 2.364 1.389 4.456 3.586 5.335V23.6c0 .255.079.483.272.676l1.53 1.477a.578.578 0 00.808-.009l2.769-2.768a.598.598 0 000-.87l-1.591-1.574 2.232-2.232a.602.602 0 00-.017-.861l-2.171-2.18c2.628-1.116 4.087-3.13 4.087-5.511A5.733 5.733 0 0014.757 4zm0 5.344a1.55 1.55 0 01-1.547-1.547c0-.861.685-1.547 1.547-1.547a1.55 1.55 0 011.547 1.547 1.55 1.55 0 01-1.547 1.547z"></path>
                        </svg>
                        {t("内测用户登录 (BUL)")}
                    </Button>

                    <hr className="border-t border-[#acaba9]/15 dark:border-[#666666] mb-8"/>

                    <div className="mb-6">
                        <label htmlFor="email"
                               className="block text-[#787874] dark:text-[#a1a1a1] text-sm font-medium mb-2">
                            {t("邮件地址")}
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t("输入你的邮件地址…")}
                            className="w-full h-10 shadow-sm"
                        />
                        <p className="text-[#acaba9] dark:text-[#8c8c8c] text-xs mt-2">
                            {t("如使用 Github 登录或内测用户登录，可省略邮件地址。")}
                        </p>
                    </div>

                    <Button className="w-full mb-8 bg-[#2383e2] hover:bg-[#2383e2]/90 dark:bg-[#1a73e8] dark:hover:bg-[#1a73e8]/90 h-10">
                        {t("继续")}
                    </Button>

                    <div className="text-xs text-[#787874] dark:text-[#a1a1a1] text-center">
                        {t("你的姓名和照片会显示给通过你的邮件邀请你加入Blur的用户。继续操作即表示，你已确认理解并同意")}
                        <a href="#" className="text-[#acaba9] dark:text-[#b3b3b3] hover:underline ml-1">
                            {t("用户协议")}
                        </a>
                        {t(" 和")}
                        <a href="#" className="text-[#acaba9] dark:text-[#b3b3b3] hover:underline ml-1">
                            {t("隐私政策")}
                        </a>
                        。
                    </div>
                </main>

                <footer className="mt-12 flex justify-end translate-x-3 relative">
                    <div className="mr-12 -mt-5">
                        {isDropdownOpen && (
                            <LanguageDropdown
                                direction="up"
                                setIsOpen={setIsDropdownOpen}
                            />
                        )}
                    </div>
                    <button
                        className="text-[#91918e] dark:text-[#b3b3b3] text-sm flex items-center relative z-10"
                        onClick={toggleDropdown}
                    >
                        <LanguagesIcon className="w-3.5 h-3.5 mr-1 text-[#acaba9] dark:text-[#b3b3b3]" />
                        {getLanguageName(language)}
                        <motion.div
                            className="flex items-center"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isDropdownOpen ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                            ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                            )}
                        </motion.div>
                    </button>
                </footer>
            </div>
        </div>
    );
}
