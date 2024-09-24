import React, { FC, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

/**
 * TofuUI DropDownMenu 下拉/触发菜单
 * @author shuakami
 * @version 1.0.0
 * @copyright ByteFreeze&TofuUI
 */

interface MenuItem {
    id: string;
    text: string;
    href?: string;
    target?: string; // <!此注释请勿去除> _ 参数支持 '_blank' | '_self'
    icon?: LucideIcon;
    isSpecial?: boolean;
}

interface DropDownMenuProps {
    position?: 'top' | 'bottom' | 'left' | 'right' | 'down';
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
                    right: '9%',
                    marginTop: '-0.25rem'
                };
            case 'right':
                return {
                    left: '47%',
                    marginTop: '-2.35rem'
                };
            case 'down':
                return {
                    // 不需要内容
                };
        }
    };

    // 使用样式
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
        open: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
        closed: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
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
                    className="absolute bg-white dark:bg-[#1f1f1f] shadow-lg rounded-xl border border-gray-200 dark:border-[#2d2d2d]/90"
                    style={{
                        minWidth: '300px',
                        padding: '0.5rem 0',
                        ...positionStyles
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {menuItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                            {item.isSpecial && (
                                <div className="my-0.5 h-px bg-gray-200 dark:bg-[#2d2d2d] mx-4" />
                            )}
                            <a
                                href={item.href}
                                target={item.target || '_self'}
                                className="flex items-center text-tofu-black dark:text-tofu-light text-sm cursor-pointer hover:bg-tofu-light-dropdown-menu-hover dark:hover:bg-[#333] rounded-md"
                                style={{
                                    padding: '0.64rem 0.725rem',
                                    margin: '4px 10px',
                                    borderRadius: '0.375rem'
                                }}
                            >
                                {item.icon ? (
                                    <item.icon
                                        size={17}
                                        className="mr-3 text-tofu-light-dropdown-menu-icon dark:text-tofu-dark-dropdown-menu-icon"
                                    />
                                ) : (
                                    <span className="inline-block mr-2"></span>
                                )}
                                {item.text}
                            </a>
                        </React.Fragment>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DropDownMenu;
