"use client";

import {useState, useEffect} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {createPortal} from "react-dom";
import {CloseIcon} from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import {SettingsSidebar} from "@/app/[设置]/sidebar";
import {SettingsMain} from "@/app/[设置]/main";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({isOpen, onClose}) => {
    const [activeTab, setActiveTab] = useState("general");
    const [isBrowser, setIsBrowser] = useState(false); // 检查是否在浏览器环境

    // 确保在客户端环境中设置 isBrowser
    useEffect(() => {
        setIsBrowser(true);
    }, []);

    // 仅在浏览器环境下渲染 createPortal
    if (!isBrowser) {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 遮罩层 */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3, ease: "easeOut"}}
                    />

                    {/* 模态框 */}
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
                            className="border border-gray-400 dark:border-gray-900 relative flex h-[85vh] w-full max-w-6xl rounded-lg bg-background text-start shadow-xl z-60 focus:outline-none"
                        >
                            {/* 设置的侧边栏 */}
                            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab}/>

                            {/* 设置内容区域 */}
                            <SettingsMain activeTab={activeTab} setActiveTab={setActiveTab}/>

                            {/* 关闭按钮 */}
                            <button
                                className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 text-sm z-70"
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

export default SettingsModal;
