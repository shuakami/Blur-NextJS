"use client";

import {Sidebar} from "./sidebar";
import {PersonalCenterMain} from "./main";
import {motion, AnimatePresence} from "framer-motion";
import {CloseIcon} from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import {createPortal} from "react-dom";
import {useState} from "react";
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

    // 如果用户信息未加载，显示加载中状态
    if (!isLoaded) {
        return <PersonalCenterLoading isOpen={isOpen} onClose={onClose}/>;
    }

    // 如果用户未登录，跳回去首页
    if (!isSignedIn) {
        router.push("/");
    }

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
                            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}/>
                            <PersonalCenterMain/>
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

export default PersonalCenter;
