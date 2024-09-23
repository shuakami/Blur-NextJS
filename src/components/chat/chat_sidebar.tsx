"use client"
import React, { useState } from 'react'
import {
    FolderOpen,
    ChevronRight,
    ChevronDown,
    Settings,
    LucideAppWindow,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FolderAddIcon } from "hugeicons-react"

interface SidebarItem {
    icon?: React.ReactNode;
    label: string;
    href?: string;
    children?: SidebarItem[];
    date?: string;
}

interface ChatSidebarProps {
    items: SidebarItem[];
}


const CustomButton: React.FC<{ label: string, href?: string }> = ({ label, href }) => {
    return (
        <a
            href={href}
            className="w-40 mx-3 text-sm mt-1 flex items-center space-x-2 hover:bg-[#f0f0f0] dark:hover:bg-[#1e1e1e] rounded-md py-2 px-3 transition-colors duration-200 text-left text-black dark:text-white"
        >
            <span className="flex-grow">{label}</span>
        </a>
    )
}

const SidebarItemComponent: React.FC<{ item: SidebarItem; level: number }> = ({ item, level }) => {
    const [isOpen, setIsOpen] = useState(true)

    const toggleOpen = () => setIsOpen(!isOpen)

    if (item.date) {
        return (
            <div className="mt-4 first:mt-0">
                <div className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider mb-2 px-4 ml-0.5">{item.date}</div>
                {item.children?.map((child, index) => (
                    <SidebarItemComponent key={index} item={child} level={level} />
                ))}
            </div>
        )
    }

    return (
        <div>
            <button
                onClick={toggleOpen}
                className={`mt-1 flex items-center space-x-2 hover:bg-[#f0f0f0] dark:hover:bg-[#1e1e1e] rounded-md mx-2 py-2 px-3 transition-colors duration-200 w-[185px] text-left ${level > 0 ? 'pl-4' : ''} text-black dark:text-white`}
            >
                {item.icon && <span className="text-black dark:text-white">{item.icon}</span>}
                {item.children && (
                    <span className="text-black dark:text-white">
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                )}
                <span className="text-sm flex-grow">{item.label}</span>
            </button>
            {item.children && isOpen && (
                <div className="ml-1">
                    {item.children.map((child, index) => (
                        child.children ? (
                            <SidebarItemComponent key={index} item={child} level={level + 1} />
                        ) : (
                            <CustomButton key={index} label={child.label} href={child.href} />
                        )
                    ))}
                </div>
            )}
        </div>
    )
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ items }) => {
    return (
        <div className="flex flex-col h-screen w-52 bg-[#F9F9F9]/65 dark:bg-[#171717] text-black dark:text-white">
            <ScrollArea className="flex-grow">
                <div className="flex space-x-3 mt-5 w-44 justify-center items-center mx-4">
                    <Button variant="ghost"
                            className="w-1/2 text-black dark:text-white bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121] flex items-center justify-center">
                        <LucideAppWindow size={20} className="text-black dark:text-white"/>
                    </Button>
                    <Button variant="ghost"
                            className="w-1/2 hover:bg-[#f0f0f0] bg-black/10 dark:bg:white/10 dark:hover:bg-[#1e1e1e] flex items-center justify-center">
                        <FolderAddIcon size={20} className="text-black dark:text-white"/>
                    </Button>
                </div>

                <div className="py-4 mt-2">
                    {items.length > 0 ? (
                        items.map((item, index) => (
                            <SidebarItemComponent key={index} item={item} level={0}/>
                        ))
                    ) : (
                        <div className="text-center text-sm text-black dark:text-white">暂无对话</div>
                    )}
                </div>
            </ScrollArea>

            <div className="py-2 px-2">
                <div className="flex items-center space-x-2 hover:bg-[#f0f0f0] dark:hover:bg-[#1e1e1e] rounded-sm p-3">
                    <Avatar className="h-9 w-9 border border-black/10 dark:border-white/10 py-1 px-1">
                        <AvatarImage src="https://github.com/shuakami.png" alt="User avatar"/>
                    </Avatar>
                    <div className="flex flex-col">
                        <h2 className="text-xs-sm font-semibold text-black dark:text-white">Admin</h2>
                        <p className="text-xs text-black dark:text-[#9e9e9e]">Test#AL1_0001</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatSidebar
