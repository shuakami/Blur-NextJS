"use client";

import {motion, AnimatePresence} from "framer-motion";
import {Skeleton} from "@/components/ui/skeleton"; // Skeleton 组件
import {CloseIcon} from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import {createPortal} from "react-dom";
import {useState} from "react";

interface PersonalCenterLoadingProps {
    isOpen: boolean;
    onClose: () => void;
}

const PersonalCenterLoading: React.FC<PersonalCenterLoadingProps> = ({isOpen, onClose}) => {
    const [activeTab, setActiveTab] = useState("profile");

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 遮罩层 */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 z-40"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3, ease: "easeOut"}}
                    />

                    {/* 模态框 Skeleton */}
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.9}}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            duration: 0.6,
                        }}
                    >
                        <div
                            className="relative flex h-[85vh] w-full max-w-6xl rounded-lg bg-background text-start shadow-xl z-60 focus:outline-none">
                            {/* Sidebar Skeleton */}
                            <div className="flex flex-col p-4 w-64 border-r h-full">
                                <div className="space-y-4 mt-4">
                                    <Skeleton className="h-8 w-3/4 mb-6"/> {/* 个人中心标题 */}
                                    <Skeleton className="h-4 w-1/2 mb-2"/> {/* 描述 */}

                                    {/* 模拟 Sidebar 菜单选项 */}
                                    {[...Array(5)].map((_, index) => (
                                        <motion.div
                                            key={index}
                                            className="mb-4"
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.5, delay: index * 0.1}}
                                        >
                                            <Skeleton className="h-10 w-full mb-2"/>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* 退出登录按钮 Skeleton */}
                                <div className="mt-auto w-full">
                                    <Skeleton className="h-10 w-full mb-2"/> {/* 确保按钮在最底部 */}
                                </div>
                            </div>


                            {/* Main Content Skeleton */}
                            <div className="flex-1 overflow-auto p-8 space-y-6">
                                {/* 模拟头像和名字 */}
                                <motion.div
                                    className="flex items-center space-x-4"
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.5, delay: 0.1}}
                                >
                                    <Skeleton className="h-16 w-16 rounded-full"/> {/* 头像 */}
                                    <div>
                                        <Skeleton className="h-6 w-32 mb-2"/> {/* 用户名 */}
                                        <Skeleton className="h-4 w-24"/> {/* 邮箱 */}
                                    </div>
                                </motion.div>

                                {/* 模拟多个内容块 */}
                                <motion.div
                                    className="space-y-2"
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.5, delay: 0.2}}
                                >
                                    <Skeleton className="h-6 w-1/4"/> {/* "用户名" 标签 */}
                                    <Skeleton className="h-10 w-full"/> {/* 输入框 */}
                                </motion.div>

                                <motion.div
                                    className="space-y-2"
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.5, delay: 0.3}}
                                >
                                    <Skeleton className="h-6 w-1/4"/> {/* "电子邮件" 标签 */}
                                    <Skeleton className="h-10 w-full"/> {/* 输入框 */}
                                </motion.div>

                                <motion.div
                                    className="space-y-2"
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.5, delay: 0.4}}
                                >
                                    <Skeleton className="h-6 w-1/4"/> {/* "连接的账户" 标签 */}
                                    <Skeleton className="h-10 w-full"/> {/* GitHub 账户 */}
                                </motion.div>
                            </div>

                            {/* 关闭按钮 */}
                            <button
                                className="absolute top-4 right-4 text-black/50 text-sm z-70"
                                onClick={onClose}
                            >
                                <CloseIcon/>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default PersonalCenterLoading;
