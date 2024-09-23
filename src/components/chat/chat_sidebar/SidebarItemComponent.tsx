// src/components/chat/SidebarItemComponent.tsx
"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DateLabel from '@/lib/DateLabel';
import { SidebarItemType } from './types';
import CustomButton from './CustomButton';

interface SidebarItemComponentProps {
    item: SidebarItemType;
    level: number;
    selectedItem: string | null;
    onSelect: (label: string) => void;
}

const SidebarItemComponent: React.FC<SidebarItemComponentProps> = ({ item, level, selectedItem, onSelect }) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);

    const toggleOpen = () => setIsOpen(!isOpen);

    // @ts-ignore
    const isSelected = selectedItem === item.label;

    if ('date' in item) {
        return (
            <div className="mt-4 first:mt-0">
                <div className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-2 px-4 ml-0.5">
                    <DateLabel timestamp={item.date} />
                </div>
                <AnimatePresence initial={false}>
                    {item.children?.map((child, index) => (
                        <SidebarItemComponent
                            key={`${child.label}-${index}`} // 确保唯一性
                            item={child}
                            level={level}
                            selectedItem={selectedItem}
                            onSelect={onSelect}
                        />
                    ))}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* 文件夹类型的对话 */}
            <button
                onClick={item.children ? toggleOpen : () => onSelect(item.label)}
                className={`mt-1 flex items-center space-x-2 rounded-md mx-3 py-2 px-3 transition-colors duration-200 w-[185px] text-left ${
                    level > 0 ? 'pl-4' : ''
                } text-black dark:text-white ${
                    isSelected ? 'bg-[#e0e0e0] dark:bg-[#333333]' : 'hover:bg-[#f0f0f0] dark:hover:bg-[#1e1e1e]'
                }`}
            >
                {item.icon && <span className="text-black dark:text-white">{item.icon}</span>}
                {item.children && (
                    <span className="text-black dark:text-white">
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                )}
                <span className="text-sm flex-grow">{item.label}</span>
            </button>

            {/* 如果有子对话，则显示 */}
            {item.children && isOpen && (
                <div className="ml-1">
                    <AnimatePresence initial={false}>
                        {item.children.map((child, index) => (
                            child.children ? (
                                <SidebarItemComponent
                                    key={`${child.label}-${index}`}
                                    item={child}
                                    level={level + 1}
                                    selectedItem={selectedItem}
                                    onSelect={onSelect}
                                />
                            ) : (
                                <CustomButton
                                    key={`${child.label}-${index}`}
                                    label={child.label}
                                    href={child.href}
                                    selected={selectedItem === child.label}
                                    onClick={() => onSelect(child.label)}
                                />
                            )
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default SidebarItemComponent;
