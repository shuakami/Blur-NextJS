import React, { FC, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {ChevronRight, LucideIcon} from 'lucide-react';

interface MenuItem {
    id: string;
    text: string;
    href?: string;
    target?: string;
    icon?: LucideIcon;
    isSpecial?: boolean;
    isDanger?: boolean;
    onClick?: () => void; // 添加 onClick 事件
}

interface DropDownMenuProps {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'down' | 'sidebar';
    isOpen: boolean;
    menuItems: MenuItem[];
    onClose?: () => void;
}

const DropDownMenu: FC<DropDownMenuProps> = ({ isOpen, menuItems, onClose, position = 'bottom' }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    const getPositionStyles = () => {
        switch (position) {
            case 'top':
                return {
                    bottom: '-15%',
                    transform: 'translateY(-0px)'
                };
            case 'bottom':
            default:
                return {
                    top: '125%',
                    transform: 'translateY(0px)'
                };
            case 'left':
                return {
                    right: '7.5%',
                    marginTop: '-0.25rem'
                };
            case 'sidebar':
                return {
                    left: '21.5%',
                    marginTop: '-2.35rem'
                };
            case 'right':
                return {
                    left: '47%',
                    marginTop: '-2.35rem'
                };
            case 'down':
                return {};
        }
    };

    const positionStyles = getPositionStyles();

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
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        closed: {
            opacity: 0,
            scale: 0.95,
            y: -10,
            transition: {
                duration: 0.2
            }
        }
    };

    const handleMenuItemClick = (item: MenuItem, e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault(); // 阻止默认行为，确保 onClick 被优先执行

        if (item.onClick) {
            // 如果存在自定义的 onClick，则执行它
            item.onClick();
        } else if (item.href) {
            // 如果没有自定义 onClick 则执行 href 跳转
            if (item.target === '_blank') {
                window.open(item.href, item.target);
            } else {
                window.location.href = item.href;
            }
        }

        // 关闭菜单
        onClose?.();
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
                    transition={{duration: 0.3, ease: "easeInOut"}}
                    className="fixed cursor-pointer backdrop-blur-md bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                    style={{
                        zIndex: 999,
                        minWidth: '250px',
                        ...positionStyles
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
                                    onClick={(e) => handleMenuItemClick(item, e)} // 绑定点击事件
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
