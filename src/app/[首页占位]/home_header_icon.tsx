"use client";

import React from 'react';
import {Button} from "@/components/ui/button";
import {SidebarOpenIcon} from "lucide-react";
import {motion} from 'framer-motion';

interface HomeHeaderIconProps {
    onOpen: () => void;
}

const HomeHeaderIcon: React.FC<HomeHeaderIconProps> = ({onOpen}) => {
    return (
        <motion.div
            initial={{opacity: 0, x: -100}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -100}}
            transition={{duration: 0.5}}
            className="fixed top-4 left-4"
        >
            <Button
                variant="ghost"
                className="text-black dark:text-white bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121] flex items-center justify-center"
                onClick={onOpen}
            >
                <SidebarOpenIcon size={20} className="text-black dark:text-white"/>
            </Button>
        </motion.div>
    );
};

export default HomeHeaderIcon;
