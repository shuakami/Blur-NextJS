import React, {useState} from 'react';
import {Search, ChevronDown} from 'lucide-react';

interface SpecialButtonProps {
    icon: React.ComponentType<{ className?: string }>; // icon 类型
    text: string;
}

interface NavItemWithDropdownProps {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
    items: { text: string }[];
}

interface SidebarProps {
    searchPlaceholder?: string; // 搜索框占位符
    specialButtons: SpecialButtonProps[]; // 自定义特殊按钮
    navItems: NavItemWithDropdownProps[]; // 导航菜单
}

export default function DocsSidebar({
                                        searchPlaceholder = "搜索文档...",
                                        specialButtons,
                                        navItems
                                    }: SidebarProps) {
    return (
        <aside className="sticky w-64 p-6">
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-250 focus:border-transparent"
                    />
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                </div>
            </div>

            <div className="mb-8 space-y-3">
                {specialButtons.map((button, index) => (
                    <SpecialButton key={index} icon={button.icon} text={button.text}/>
                ))}
            </div>

            <nav className="overflow-auto max-h-[380px]">
                <h2 className="text-[14px] text-gray-500 uppercase tracking-wider mb-4">文档导航</h2>
                <ul className="space-y-2">
                    {navItems.map((item, index) => (
                        <NavItemWithDropdown
                            key={index}
                            icon={item.icon}
                            text={item.text}
                            items={item.items}
                        />
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

// SpecialButton 组件：支持传递icon和text作为props
function SpecialButton({icon: Icon, text}: SpecialButtonProps) {
    const [selected, setSelected] = useState(false); // 控制选中状态

    return (
        <button
            className={`w-full flex items-center px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selected ? 'text-gray-800 font-semibold' : 'text-black/70 hover:text-black'
            }`}
            onClick={() => setSelected(!selected)}
        >
            <div className={`flex items-center justify-center w-[29.5px] h-[29.5px] rounded-md mr-3 ${
                selected ? 'bg-black' : 'bg-white border-gray-200 border'
            }`}>
                <Icon className={`w-3.5 h-3.5 ${selected ? 'text-white' : 'text-black'}`}/>
            </div>
            <span className="flex-grow text-left">{text}</span>
        </button>
    );
}

// NavItemWithDropdown 组件：支持传递icon、text和items作为props
function NavItemWithDropdown({icon: Icon, text, items}: NavItemWithDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // 控制二级菜单选中状态

    return (
        <li>
            <details className="group" open={isOpen} onToggle={() => setIsOpen(!isOpen)}>
                <summary
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3 text-gray-500"/>
                        {text}
                    </div>
                    <ChevronDown
                        className="w-4 h-4 text-gray-400 group-open:transform group-open:rotate-180 transition-transform"/>
                </summary>
                <ul className="mt-1 ml-5 space-y-1 border-l border-gray-150 pl-4">
                    {items.map((item, index) => (
                        <li key={index}>
                            <a
                                href="#"
                                className={`block py-2 px-2 text-sm rounded-md transition-colors ${
                                    selectedIndex === index
                                        ? 'text-black bg-gray-100/80'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                                onClick={() => setSelectedIndex(index)}
                            >
                                {item.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </details>
        </li>
    );
}
