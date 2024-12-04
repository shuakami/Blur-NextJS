"use client";

import React, { FC, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, LucideIcon } from 'lucide-react';
import { useFloating, shift, offset, flip, autoUpdate } from '@floating-ui/react-dom';
import Cookies from 'js-cookie';
import { cn } from '../../../lib/utils/utils';

interface MenuItem {
    id: string;
    text: string;
    description?: string;
    href?: string;
    target?: string;
    icon?: LucideIcon | React.ComponentType;
    isSpecial?: boolean;
    isDanger?: boolean;
    isDisabled?: boolean;
    onClick?: () => void;
}

interface DropDownMenuPlusProps {
    referenceElement?: HTMLElement | null;
    isOpen: boolean;
    menuItems: MenuItem[];
    onClose?: () => void;
    placement?: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'bottom-center';
    className?: string;
}

const DropDownMenuPlus: FC<DropDownMenuPlusProps> = ({
                                                         referenceElement,
                                                         isOpen,
                                                         menuItems,
                                                         onClose,
                                                         placement = 'right',
                                                         className
                                                     }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    const alignPlacement = () => {
        if (isMobile) {
            return 'bottom';
        }
        switch (placement) {
            case 'right':
                return 'right-start';
            case 'left':
                return 'left-start';
            case 'top':
                return 'top-start';
            case 'bottom':
                return 'bottom-start';
            case 'center':
                return 'bottom';
            default:
                return 'left-start';
        }
    };

    const { x, y, strategy, refs, update } = useFloating({
        placement: alignPlacement(),
        strategy: 'fixed',
        middleware: [
            offset(isMobile ? 12 : 8),
            flip(),
            shift({
                padding: 8,
                crossAxis: true,
                mainAxis: true,
            }),
        ],
        whileElementsMounted: autoUpdate,
    });

    useEffect(() => {
        if (referenceElement && refs.setReference) {
            refs.setReference(referenceElement);
        }
        if (menuRef.current) {
            refs.setFloating(menuRef.current);
        }
    }, [referenceElement, isOpen, refs]);

    useEffect(() => {
        if (isOpen) {
            update();
        }
    }, [isOpen, update]);

    const handleMenuItemClick = (item: MenuItem, e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        if (item.onClick) {
            item.onClick();
        }

        // Update selected item and cookie
        setSelectedItemId(item.id);
        Cookies.set('selectedMenuItem', item.id); // 保存选中项到cookie
        onClose?.();
    };

    // 组件加载时从cookie中恢复选中项
    useEffect(() => {
        const savedItemId = Cookies.get('selectedMenuItem');
        setSelectedItemId(savedItemId || null);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose?.();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const menuVariants = {
        open: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
            },
        },
        closed: {
            opacity: 0,
            scale: 0.95,
            y: -10,
            transition: {
                duration: 0.2,
            },
        },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={menuVariants}
                    className={cn(
                        "fixed z-50 cursor-pointer backdrop-blur-md",
                        "bg-white/80 dark:bg-gray-800/80",
                        "shadow-lg rounded-xl",
                        "border border-gray-200/50 dark:border-gray-700/50",
                        "overflow-hidden",
                        "xl:min-w-[420px] min-w-[375px]",
                        className
                    )}
                    style={{
                        position: strategy,
                        top: y ?? 0,
                        left: x ?? 0,
                        ...(isMobile && {
                            width: 'calc(100vw - 32px)',
                            maxWidth: '420px',
                        })
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="sm:p-2 p-1">
                        {menuItems.map((item, index) => (
                            <React.Fragment key={item.id}>
                                {item.isSpecial && index > 0 && (
                                    <div className="h-px bg-gray-200/50 dark:bg-gray-700/50 my-1" />
                                )}
                                <a
                                    href={item.isDisabled ? undefined : item.href}
                                    target={item.target || '_self'}
                                    className={`flex items-start 
                                        md:px-4 px-6 py-3 
                                        text-sm rounded-lg transition-all duration-200 ease-in-out group
                                        ${item.isDisabled 
                                            ? 'cursor-not-allowed opacity-50' 
                                            : item.isDanger
                                                ? 'text-red-400 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/30'
                                                : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-gray-700/70'
                                        }`}
                                    onClick={(e) => {
                                        if (item.isDisabled) {
                                            e.preventDefault();
                                            return;
                                        }
                                        handleMenuItemClick(item, e);
                                    }}
                                >
                                    {item.icon && (
                                        <item.icon className={`
                                            mr-3 mt-0.5
                                            h-[18px] w-[18px] 
                                            transition-colors duration-200
                                            ${item.isDisabled
                                                ? 'opacity-50'
                                                : item.isDanger
                                                    ? 'text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300'
                                                    : 'text-gray-700 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-400'
                                            }`}
                                        />
                                    )}
                                    <div className="flex-grow">
                                        <span className="font-medium text-sm">{item.text}</span>
                                        {item.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                    {selectedItemId === item.id && (
                                        <Check className="h-5 w-5 text-primary-600 ml-2" />
                                    )}
                                </a>
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DropDownMenuPlus;
