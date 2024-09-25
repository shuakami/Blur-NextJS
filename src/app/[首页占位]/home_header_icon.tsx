// components/home_header_icon.tsx
"use client";

import React from 'react';
import {Button} from "@/components/ui/button";
import {SidebarOpenIcon} from "lucide-react";
import {motion, AnimatePresence} from 'framer-motion';

interface HomeHeaderIconProps {
    isSidebarOpen: boolean;
    onOpen: () => void;
}

const HomeHeaderIcon: React.FC<HomeHeaderIconProps> = ({isSidebarOpen, onOpen}) => {
    return (
        <AnimatePresence>
            {!isSidebarOpen && (
                <motion.div
                    key="open-icon"
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: -20}}
                    transition={{duration: 0.3}}
                    className="absolute top-4 left-4 z-50"
                >
                    <Button
                        variant="ghost"
                        className="p-2 bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121] flex items-center justify-center rounded-full"
                        onClick={onOpen}
                    >
                        <SidebarOpenIcon size={20} className="text-black dark:text-white"/>
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HomeHeaderIcon;
