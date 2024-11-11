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
    const [isBrowser, setIsBrowser] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsBrowser(true);
    }, []);

    if (!isBrowser) return null;

    // 定义简化后的动画变体
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    const sidebarVariants = {
        hidden: { x: '-100%' },
        visible: { x: 0 },
        exit: { x: '-100%' }
    };

    return createPortal(
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* 主遮罩层 */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    {/* 手机端侧边栏 */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden">
                            <motion.div
                                className="fixed inset-0 bg-black/50 z-[100]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                            
                            <motion.div
                                className="fixed inset-y-0 left-0 w-[280px] bg-background shadow-lg z-[101]"
                                variants={sidebarVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ type: "tween", duration: 0.2 }}
                            >
                                <SettingsSidebar 
                                    activeTab={activeTab} 
                                    setActiveTab={(tab) => {
                                        setActiveTab(tab);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    isMobile={true}
                                />
                            </motion.div>
                        </div>
                    )}

                    {/* 模态框 */}
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ 
                            duration: 0.2,
                            ease: "easeOut"
                        }}
                    >
                        <div className="border border-gray-400 dark:border-gray-900 relative flex flex-col md:flex-row 
                            md:h-[76vh] h-[85vh] w-full max-w-6xl rounded-lg bg-background text-start shadow-xl z-60 
                            focus:outline-none overflow-hidden"
                        >
                            {/* 手机端菜单按钮 */}
                            <button
                                className="md:hidden absolute left-4 top-4 p-2 hover:bg-gray-100 
                                dark:hover:bg-gray-800 rounded-full transition-colors duration-200 
                                text-gray-600 dark:text-gray-300 z-70"
                                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* PC/平板端侧边栏 */}
                            <div className="hidden md:block w-[280px] min-w-[280px]">
                                <SettingsSidebar 
                                    activeTab={activeTab} 
                                    setActiveTab={setActiveTab}
                                    isMobile={false}
                                />
                            </div>
                            
                            {/* 主内容区域 */}
                            <div className="flex-1 min-w-0 overflow-auto">
                                <SettingsMain activeTab={activeTab} setActiveTab={setActiveTab} />
                            </div>

                            {/* 关闭按钮 */}
                            <button
                                className="absolute top-2 right-2 md:top-4 md:right-4 p-2 hover:bg-gray-100 
                                dark:hover:bg-gray-800 rounded-full transition-colors duration-200 
                                text-gray-600 dark:text-gray-300 z-70"
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
