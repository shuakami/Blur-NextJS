import React from "react";
import Image from "next/image";
import {Check} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import useTranslation from "@/hooks/useTranslation";
import {useTheme} from "next-themes";

export const ThemeSettings: React.FC = () => {
    const {t} = useTranslation();
    const {theme: currentTheme, setTheme} = useTheme();

    const handleThemeChange = (theme: "light" | "dark" | "system") => {
        setTheme(theme);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h2 className="text-2xl font-semibold mb-2">{t("主题设置")}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {t("选择适合您的显示模式。")}
            </p>

            <motion.div
                className="grid grid-cols-3 gap-4"
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.3}}
            >
                {["light", "dark", "system"].map((theme) => (
                    <motion.div
                        key={theme}
                        className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                            currentTheme === theme
                                ? "ring-2 ring-blue-500"
                                : "ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-blue-300"
                        }`}
                        onClick={() => handleThemeChange(theme as "light" | "dark" | "system")}
                        whileTap={{scale: 0.98}}
                        transition={{type: "spring", stiffness: 400, damping: 30}}
                    >
                        <div className="relative w-full" style={{aspectRatio: "5 / 3"}}>
                            <Image
                                src={`/img/settings/theme/${theme}-theme.webp`}
                                alt={`${theme} Theme Preview`}
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/35 to-transparent p-2">
                            <p className="text-center text-xs text-white font-medium">
                                {t(theme === "light" ? "明亮模式" : theme === "dark" ? "暗黑模式" : "跟随系统")}
                            </p>
                        </div>
                        <AnimatePresence>
                            {currentTheme === theme && (
                                <motion.div
                                    className="absolute top-2 right-2 bg-blue-500 rounded-full p-1"
                                    initial={{opacity: 0, scale: 0.5}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.5}}
                                    transition={{duration: 0.2}}
                                >
                                    <Check className="h-3 w-3 text-white"/>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};
