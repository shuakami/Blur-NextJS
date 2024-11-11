"use client";

import React, { FC, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, LucideIcon } from 'lucide-react';
import { useFloating, shift, offset, flip, autoUpdate } from '@floating-ui/react-dom';
import Cookies from 'js-cookie';

interface MenuItem {
    id: string;
    text: string;
    description?: string;
    href?: string;
    target?: string;
    icon?: LucideIcon | React.ComponentType;
    isSpecial?: boolean;
    isDanger?: boolean;
    onClick?: () => void;
}

interface DropDownMenuPlusProps {
    referenceElement?: HTMLElement | null;
    isOpen: boolean;
    menuItems: MenuItem[];
    onClose?: () => void;
    placement?: 'left' | 'right' | 'top' | 'bottom' | 'center';
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

    const alignPlacement = () => {
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
                return 'left-start';  // 默认
        }
    };

    // 使用 Floating UI 计算菜单的位置
    const { x, y, strategy, refs, update } = useFloating({
        placement: alignPlacement(),
        strategy: 'fixed',
        middleware: [offset(8), flip(), shift()],
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
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`fixed z-50 w-auto cursor-pointer backdrop-blur-md 
                    bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl 
                    border border-gray-200/50 dark:border-gray-700/50 overflow-hidden
                    xl:min-w-[420px]
                    min-w-[375px]
                    mx-4
                    ${className}`}
                style={{
                    position: strategy,
                    top: y ?? 0,
                    left: x ?? 0,
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
                                href={item.href}
                                target={item.target || '_self'}
                                className={`flex items-start 
                                    md:px-4 md:py-3 
                                    sm:px-3 sm:py-2.5 
                                    px-2.5 py-2
                                    text-sm rounded-lg transition-all duration-200 ease-in-out group
                                    ${item.isDanger
                                    ? 'text-red-400 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/30'
                                    : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-gray-700/70'
                                }`}
                                onClick={(e) => handleMenuItemClick(item, e)}
                            >
                                {item.icon && (
                                    <item.icon className={`
                                        md:mr-3 sm:mr-2.5 mr-2 
                                        md:h-5 md:w-5 
                                        sm:h-4.5 sm:w-4.5 
                                        h-4 w-4 
                                        transition-colors duration-200
                                        ${item.isDanger
                                        ? 'text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300'
                                        : 'text-gray-700 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-400'
                                    }`}
                                    />
                                )}
                                <div className="flex-grow">
                                    <span className="font-medium md:text-sm text-[13px]">{item.text}</span>
                                    {item.description && (
                                        <p className="md:text-xs text-[11px] text-gray-500 dark:text-gray-400 
                                            md:mt-1 mt-0.5">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                                {selectedItemId === item.id && (
                                    <Check className="md:h-5 md:w-5 h-4 w-4 text-primary-600 md:ml-2 ml-1.5" />
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
