// HomeHeaderIcon.tsx

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { SidebarOpenIcon, SquarePen } from "lucide-react";
import { cn } from '../../lib/utils/utils';

interface HomeHeaderIconProps {
    isSidebarOpen: boolean;
    onOpen: () => void;
}

const HomeHeaderIcon: React.FC<HomeHeaderIconProps> = ({ isSidebarOpen, onOpen }) => {
    const [isHidden, setIsHidden] = useState(isSidebarOpen);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (isSidebarOpen) {
            setIsHidden(true);
        } else {
            timeoutRef.current = setTimeout(() => {
                setIsHidden(false);
            }, 10);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isSidebarOpen]);

    return (
        <div
            className={cn(
                "flex items-center",
                "transform transition-all duration-200 ease-in-out z-40",
                {
                    "opacity-0 -translate-x-5 pointer-events-none": isHidden,
                    "opacity-100 translate-x-0": !isHidden
                }
            )}
        >
            <Button
                variant="ghost"
                className={cn(
                    "p-2 flex items-center justify-center rounded-md",
                    "transition-colors duration-200",
                    "hover:bg-secondary"
                )}
                onClick={onOpen}
            >
                <SidebarOpenIcon 
                    className="w-[21px] h-[21px] text-gray-750 dark:text-gray-300
                             transition-transform duration-200"
                />
            </Button>

            <a
                href="/?new=true"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "hidden md:flex items-center mx-1 rounded-md p-2",
                    "transition-colors duration-200",
                    "hover:bg-secondary"
                )}
            >
                <SquarePen 
                    className="w-[21px] h-[21px] text-gray-750 dark:text-gray-300
                             transition-transform duration-200"
                />
            </a>
        </div>
    );
};

export default HomeHeaderIcon;
