"use client";

import React, {useState, useEffect} from 'react';
import {Button} from "@/components/ui/button";
import {SidebarOpenIcon, SquarePen} from "lucide-react";
import {motion, AnimatePresence} from 'framer-motion';

interface HomeHeaderIconProps {
    isSidebarOpen: boolean;
    onOpen: () => void;
}

const HomeHeaderIcon: React.FC<HomeHeaderIconProps> = ({isSidebarOpen, onOpen}) => {
    const [mounted, setMounted] = useState(false);

    // 使用 useEffect 在客户端挂载时设置 mounted 为 true
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // 在服务器端渲染时不显示内容，避免与客户端不匹配
        return null;
    }

    return (
        <AnimatePresence>
            {!isSidebarOpen && (
                <motion.div
                    key="open-icon"
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: -20}}
                    transition={{duration: 0.15}}
                    className="top-2 left-4 z-50 flex items-center space-x-2"
                >
                    {/* Sidebar open button */}
                    <Button
                        variant="ghost"
                        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center justify-center rounded-md"
                        onClick={onOpen}
                    >
                        <SidebarOpenIcon className="w-[22px] h-[22px] text-gray-750 dark:text-gray-300"/>
                    </Button>

                    {/* New chat button */}
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:flex p-2 hover:bg-gray-50 dark:hover:bg-gray-850 items-center justify-center rounded-md"
                    >
                        <SquarePen className="w-[22px] h-[22px] text-gray-750 dark:text-gray-300"/>
                    </a>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HomeHeaderIcon;
