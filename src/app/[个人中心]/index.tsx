"use client";

import {Sidebar} from "./sidebar";
import {PersonalCenterMain} from "./main";
import {motion, AnimatePresence} from "framer-motion";
import {CloseIcon} from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import {createPortal} from "react-dom";
import {useState, useEffect} from "react";
import {useUser} from "@clerk/nextjs";
import PersonalCenterLoading from "@/components/Loading/loading_personal_center";
import {useRouter} from "next/navigation";

interface PersonalCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

const PersonalCenter: React.FC<PersonalCenterProps> = ({isOpen, onClose}) => {
    const [activeTab, setActiveTab] = useState("profile");
    const {isLoaded, isSignedIn} = useUser(); // 获取加载状态和登录状态
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 确保组件只在客户端渲染
    useEffect(() => {
        setMounted(true);
    }, []);

    // 如果组件尚未挂载到客户端，返回null，避免Hydration错误
    if (!mounted) return null;

    // 如果用户信息未加载，显示加载中状态
    if (!isLoaded) {
        return <PersonalCenterLoading isOpen={isOpen} onClose={onClose}/>;
    }

    // 如果用户未登录，跳回去首页
    if (!isSignedIn) {
        router.push('/?new=true');
        return null;
    }

    return createPortal(
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* 遮罩层 */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.2}}
                    />

                    {/* 手机端的侧边栏 - 使用CSS transition */}
                    <div
                        className={`md:hidden fixed inset-y-0 left-0 w-[280px] bg-background shadow-lg z-[101]
                            transition-transform duration-300 ease-out
                            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        <Sidebar 
                            activeTab={activeTab} 
                            setActiveTab={(tab) => {
                                setActiveTab(tab);
                                setIsMobileMenuOpen(false);
                            }}
                            isMobile={true}
                        />
                    </div>

                    {/* 模态框 */}
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8"
                        initial={{opacity: 0, scale: 0.95}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.95}}
                        transition={{
                            duration: 0.2,
                            ease: "easeOut"
                        }}
                    >
                        <div
                            className="border border-gray-400 dark:border-gray-900 relative flex flex-col md:flex-row 
                            md:h-[76vh] h-[85vh] w-full max-w-6xl rounded-lg bg-background text-start shadow-xl z-60 
                            focus:outline-none overflow-hidden"
                        >
                            {/* 手机端的菜单按钮 */}
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

                            {/* PC/平板端的侧边栏 */}
                            <div className="hidden md:block w-[280px] min-w-[280px]">
                                <Sidebar 
                                    activeTab={activeTab} 
                                    setActiveTab={setActiveTab}
                                    isMobile={false}
                                />
                            </div>
                            
                            {/* 主内容区域 */}
                            <div className="flex-1 min-w-0 overflow-auto">
                                <PersonalCenterMain />
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

export default PersonalCenter;
