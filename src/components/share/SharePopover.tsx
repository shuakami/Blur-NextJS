import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverDivider } from '@/components/ui/popover';
import { AnimatePresence, motion } from 'framer-motion';

interface SharePopoverProps {
    onShare: () => void;
}

const SHARE_PERMISSIONS = [
    {
        id: 'public',
        title: '公开访问',
        description: '所有人都可以查看',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        )
    },
    {
        id: 'private',
        title: '私密访问',
        description: '仅特定人员可见',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        )
    },
    {
        id: 'restricted',
        title: '限时访问',
        description: '在指定时间内可见',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }
];

export function SharePopover({ onShare }: SharePopoverProps) {
    const [currentView, setCurrentView] = useState<'main' | 'permissions'>('main');
    const [selectedPermission, setSelectedPermission] = useState(SHARE_PERMISSIONS[0]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                    transition-all duration-200 text-gray-600 dark:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                    title="分享对话"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[21px] w-[21px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                </button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[300px] mr-8"
                align="start"
                side="bottom"
                sideOffset={8}
                mobileHeader={{
                    title: '分享对话',
                }}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {currentView === 'main' ? (
                        <motion.div
                            key="main"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                        >
                            <PopoverHeader>
                                <h3 className="text-sm font-medium">分享对话</h3>
                                <p className="text-xs text-gray-500">生成链接分享给其他人</p>
                            </PopoverHeader>
                            <PopoverBody className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-gray-500">分享链接</div>
                                        <button
                                            onClick={onShare}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-700 
                                            dark:text-blue-500 dark:hover:text-blue-400
                                            transition-colors"
                                        >
                                            复制链接
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md
                                        bg-gray-50 dark:bg-gray-800
                                        ring-1 ring-gray-200 dark:ring-gray-700
                                        hover:ring-gray-300 dark:hover:ring-gray-600
                                        transition-all duration-200">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${window.location.origin}/share${window.location.pathname}`}
                                            className="flex-1 block w-full bg-transparent border-0 
                                            text-xs text-gray-600 dark:text-gray-300
                                            placeholder-gray-400 focus:ring-0
                                            selection:bg-blue-100 dark:selection:bg-blue-900/30"
                                            aria-label="分享链接"
                                            placeholder="分享链接"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <div className="text-xs text-gray-500">访问权限</div>
                                    <button 
                                        onClick={() => setCurrentView('permissions')}
                                        className="flex items-center justify-between w-full px-2.5 py-1.5
                                        rounded-md text-left 
                                        hover:bg-gray-50 dark:hover:bg-gray-800
                                        group transition-all duration-200"
                                        title="更改分享权限"
                                        aria-label="更改分享权限"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md
                                                bg-gray-100 dark:bg-gray-800
                                                text-gray-500 dark:text-gray-400
                                                group-hover:bg-gray-200 dark:group-hover:bg-gray-700
                                                transition-colors duration-200">
                                                {selectedPermission.icon}
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                                    {selectedPermission.title}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {selectedPermission.description}
                                                </div>
                                            </div>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" 
                                            className="h-4 w-4 text-gray-400 
                                            group-hover:text-gray-500 dark:group-hover:text-gray-300
                                            transition-all duration-200 group-hover:translate-x-0.5" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </PopoverBody>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="permissions"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                        >
                            <PopoverHeader>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentView('main')}
                                        className="p-0.5 -ml-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800
                                        text-gray-500 dark:text-gray-400
                                        transition-colors"
                                        title="返回"
                                        aria-label="返回到分享设置"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div>
                                        <h3 className="text-sm font-medium">访问权限</h3>
                                        <p className="text-xs text-gray-500">选择谁可以查看此对话</p>
                                    </div>
                                </div>
                            </PopoverHeader>
                            <PopoverDivider />
                            <PopoverBody className="p-1">
                                {SHARE_PERMISSIONS.map((permission) => (
                                    <button
                                        key={permission.id}
                                        onClick={() => {
                                            setSelectedPermission(permission);
                                            setCurrentView('main');
                                        }}
                                        className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md
                                        hover:bg-gray-50 dark:hover:bg-gray-800
                                        transition-all duration-200 group
                                        ${selectedPermission.id === permission.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                    >
                                        <div className={`p-1.5 rounded-md
                                            ${selectedPermission.id === permission.id 
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}
                                            group-hover:bg-gray-200 dark:group-hover:bg-gray-700
                                            transition-colors duration-200`}>
                                            {permission.icon}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                                {permission.title}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {permission.description}
                                            </div>
                                        </div>
                                        {selectedPermission.id === permission.id && (
                                            <svg className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" 
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </PopoverBody>
                        </motion.div>
                    )}
                </AnimatePresence>
            </PopoverContent>
        </Popover>
    );
} 