import * as React from "react";
import {Sidebar} from "./sidebar";
import {PersonalCenterMain} from "./main";
import {motion, AnimatePresence} from "framer-motion";
import {CloseIcon} from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import {createPortal} from 'react-dom';

interface PersonalCenterProps {
    onClose: () => void;
}

const PersonalCenter: React.FC<PersonalCenterProps> = ({onClose}) => {
    const [activeTab, setActiveTab] = React.useState("profile");

    // 创建模态框的Portal，并将其挂载到 body 上
    return createPortal(
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0, scale: 0.9}}
                transition={{duration: 0.3}}
            >
                {/* 模态框主体 */}
                <div
                    className="relative flex h-[85vh] w-full max-w-6xl rounded-lg bg-background text-start shadow-xl z-60 focus:outline-none">
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}/>
                    <PersonalCenterMain/>
                    {/* 关闭按钮 */}
                    <button
                        className="absolute top-4 right-4 text-black/50 text-sm z-70"  // 确保按钮在最高层次
                        onClick={onClose}
                    >
                        <CloseIcon/>
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body // 将模态框挂载到 body 上，创建独立的层叠上下文
    );
};

export default PersonalCenter;
