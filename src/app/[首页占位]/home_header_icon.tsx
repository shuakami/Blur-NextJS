"use client";

import React, {useState, useEffect, useRef} from 'react';
import {Button} from "@/components/ui/button";
import {SidebarOpenIcon, SquarePen} from "lucide-react";
import {cn} from "@/lib/utils";

interface HomeHeaderIconProps {
    isSidebarOpen: boolean;
    onOpen: () => void;
}

const HomeHeaderIcon: React.FC<HomeHeaderIconProps> = ({isSidebarOpen, onOpen}) => {
    const [mounted, setMounted] = useState(false);
    const [isHidden, setIsHidden] = useState(isSidebarOpen);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        setMounted(true);
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // 处理显示/隐藏状态
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (isSidebarOpen) {
            setIsHidden(true);
        } else {
            timeoutRef.current = setTimeout(() => {
                setIsHidden(false);
            }, 50);
        }
    }, [isSidebarOpen]);

    if (!mounted) return null;

    return (
        <div
            style={{ 
                visibility: isHidden ? 'hidden' : 'visible',
                position: 'fixed'
            }}
            className={cn(
                "top-4 left-4 z-50 flex items-center space-x-2",
                "transform transition-all duration-200 ease-in-out",
                isSidebarOpen 
                    ? "opacity-0 -translate-x-5" 
                    : "opacity-100 translate-x-0"
            )}
        >
            <Button
                variant="ghost"
                className={cn(
                    "p-2 flex items-center justify-center rounded-md",
                    "transition-colors duration-200",
                    "hover:bg-gray-50 dark:hover:bg-gray-850"
                )}
                onClick={onOpen}
            >
                <SidebarOpenIcon 
                    className="w-[22px] h-[22px] text-gray-750 dark:text-gray-300
                             transition-transform duration-200"
                />
            </Button>

            <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "hidden md:flex p-2 items-center justify-center rounded-md",
                    "transition-colors duration-200",
                    "hover:bg-gray-50 dark:hover:bg-gray-850"
                )}
            >
                <SquarePen 
                    className="w-[22px] h-[22px] text-gray-750 dark:text-gray-300
                             transition-transform duration-200"
                />
            </a>
        </div>
    );
};

export default React.memo(HomeHeaderIcon);