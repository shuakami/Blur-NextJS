import React, { FC, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {ChevronRight, LucideIcon} from 'lucide-react';
import {useFloating, shift, offset, flip, autoUpdate} from '@floating-ui/react-dom';

interface MenuItem {
    id: string;
    text: string;
    href?: string;
    target?: string;
    icon?: LucideIcon | React.ComponentType; // 或者传入react组件/svg
    isSpecial?: boolean;
    isDanger?: boolean;
    onClick?: () => void;
}

interface DropDownMenuProps {
    referenceElement?: HTMLElement | null; // 传入触发元素
    isOpen: boolean;
    menuItems: MenuItem[];
    onClose?: () => void;
    placement?: 'left' | 'right'; // 额外传递定位信息
}

const DropDownMenu: FC<DropDownMenuProps> = ({referenceElement, isOpen, menuItems, onClose, placement = 'right'}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // 使用 Floating UI 计算菜单的位置
    const {x, y, strategy, refs, update} = useFloating({
        placement: placement === 'right' ? 'right-start' : 'left-start',
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
        } else if (item.href) {
            if (item.target === '_blank') {
                window.open(item.href, item.target);
            } else {
                window.location.href = item.href;
            }
        }
        onClose?.();
    };

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
                    transition={{duration: 0.3, ease: 'easeInOut'}}
                    className="fixed z-50 w-auto cursor-pointer backdrop-blur-md bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                    style={{
                        position: strategy,
                        top: y ?? 0,
                        left: x ?? 0,
                        minWidth: '250px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-2">
                        {menuItems.map((item, index) => (
                            <React.Fragment key={item.id}>
                                {item.isSpecial && index > 0 && (
                                    <div className="h-px bg-gray-200/50 dark:bg-gray-700/50 my-1"/>
                                )}
                                <a
                                    href={item.href || '#'}
                                    target={item.target || '_self'}
                                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ease-in-out group
                                        ${item.isDanger
                                        ? 'text-red-400 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/30'
                                        : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-gray-700/70'
                                    }`}
                                    onClick={(e) => handleMenuItemClick(item, e)}
                                >
                                    {item.icon && (
                                        <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200
                                            ${item.isDanger
                                            ? 'text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300'
                                            : 'text-gray-600 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-400'
                                        }`}
                                        />
                                    )}
                                    <span className="flex-grow font-medium">{item.text}</span>
                                    {item.target === '_blank' && (
                                        <ChevronRight className={`ml-2 h-4 w-4 transition-colors duration-200
                                            ${item.isDanger
                                            ? 'text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300'
                                            : 'text-gray-600 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-400'
                                        }`}
                                        />
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

export default DropDownMenu;
