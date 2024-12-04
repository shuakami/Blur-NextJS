"use client"

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog'
import { Check, Command, Trophy } from 'lucide-react'
import { useShortcutManager } from '@/providers/ShortcutProvider'
import { toast } from '../../hooks/ui/use-toast'
import { ShortcutLearningMode } from './shortcut-learning-mode'
import { SHORTCUT_DESCRIPTIONS, SHORTCUTS } from '@/constants/shortcuts'

// 将分类定义移到组件外部
const SHORTCUT_CATEGORIES = [
    {
        id: 'essential',
        title: '常用操作',
        shortcuts: ['NEW_CHAT', 'FOCUS_CHAT', 'TOGGLE_MODEL']
    },
    {
        id: 'navigation',
        title: '导航',
        shortcuts: ['TOGGLE_SIDEBAR', 'PREV_CHAT', 'NEXT_CHAT']
    },
    {
        id: 'conversation',
        title: '对话管理',
        shortcuts: ['DELETE_CHAT']
    },
    {
        id: 'system',
        title: '系统',
        shortcuts: ['TOGGLE_COMMAND_CENTER']
    }
] as const

interface ShortcutProgress {
    id: string
    completed: boolean
    lastPracticed?: Date
}

interface ShortcutsModalProps {
    isOpen: boolean
    onClose: () => void
}

// 抽离进度显示组件
const ProgressDisplay = React.memo(({ completionRate }: { completionRate: number }) => {
    if (completionRate === 100) {
        return (
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-500/10 dark:from-amber-400/20 dark:via-amber-300/20 dark:to-amber-400/20 px-4 py-2 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping-slow rounded-full bg-amber-400/20" />
                    <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        完美掌握
                    </span>
                    <span className="text-xs text-amber-600/80 dark:text-amber-400/80">
                        已掌握全部快捷键
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {completionRate}
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500">%</span>
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium">学习进度</span>
                <span className="text-xs text-gray-500">继续加油！</span>
            </div>
        </div>
    )
})
ProgressDisplay.displayName = 'ProgressDisplay'

// 抽离快捷键按钮组件
const ShortcutButton = React.memo(({ 
    shortcutKey, 
    isCompleted, 
    onClick 
}: { 
    shortcutKey: string
    isCompleted: boolean
    onClick: () => void
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between rounded-lg px-3.5 py-2.5
                ${isCompleted 
                    ? 'border border-gray-100 dark:border-gray-800'
                    : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'} 
                transition-all duration-200 group`}
        >
            <span className="text-sm flex items-center gap-2.5">
                {isCompleted ? (
                    <Check className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500" />
                )}
                <span className="text-gray-900 dark:text-gray-100">
                    {SHORTCUT_DESCRIPTIONS[shortcutKey as keyof typeof SHORTCUT_DESCRIPTIONS]}
                </span>
            </span>
            <div className="flex items-center gap-1.5">
                {SHORTCUTS[shortcutKey as keyof typeof SHORTCUTS].split('+').map((k, i) => (
                    <kbd key={k} 
                        className="px-2 h-6 inline-flex items-center justify-center min-w-[24px] text-xs font-medium 
                            bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                            text-gray-900 dark:text-gray-100 rounded-md shadow-sm"
                    >
                        {k}
                    </kbd>
                ))}
            </div>
        </button>
    )
})
ShortcutButton.displayName = 'ShortcutButton'

// 添加移动端检测 hook
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return isMobile
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
    const isMobile = useIsMobile()
    const shortcutManager = useShortcutManager()
    const [progress, setProgress] = useState<ShortcutProgress[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('shortcut-progress')
            return saved ? JSON.parse(saved) : []
        }
        return []
    })
    const [isLearningMode, setIsLearningMode] = useState(false)
    const [currentShortcut, setCurrentShortcut] = useState<string | null>(null)

    // 计算完成度
    const completionRate = useMemo(() => {
        const allShortcuts = new Set(SHORTCUT_CATEGORIES.flatMap(cat => cat.shortcuts))
        const total = allShortcuts.size
        const uniqueCompleted = new Set(progress.filter(p => p.completed).map(p => p.id)).size
        return Math.min(100, Math.round((uniqueCompleted / total) * 100))
    }, [progress])

    // 优化快捷键管理
    useEffect(() => {
        if (isLearningMode) {
            shortcutManager.setDisabled(true)
            return () => shortcutManager.setDisabled(false)
        }
    }, [isLearningMode, shortcutManager])

    // 优化欢迎提示
    useEffect(() => {
        if (isOpen && completionRate === 0) {
            toast({
                title: "欢迎来到快捷键学习系统",
                description: "点击任意快捷键开始学习",
                duration: 3000,
            })
        }
    }, [isOpen, completionRate])

    // 优化完成处理函数
    const handleComplete = useCallback((success: boolean) => {
        if (success && currentShortcut) {
            toast({
                title: "快捷键掌握！",
                duration: 1500,
            })
            setProgress(prev => {
                const newProgress = [...prev]
                const existingIndex = newProgress.findIndex(p => p.id === currentShortcut)
                if (existingIndex >= 0) {
                    newProgress[existingIndex] = {
                        ...newProgress[existingIndex],
                        completed: true,
                        lastPracticed: new Date()
                    }
                } else {
                    newProgress.push({
                        id: currentShortcut,
                        completed: true,
                        lastPracticed: new Date()
                    })
                }
                localStorage.setItem('shortcut-progress', JSON.stringify(newProgress))
                return newProgress
            })
        }
        setIsLearningMode(false)
        setCurrentShortcut(null)
    }, [currentShortcut])

    // 优化快捷键选择函数
    const handleShortcutSelect = useCallback((shortcutKey: string) => {
        setCurrentShortcut(shortcutKey)
        setIsLearningMode(true)
    }, [])

    // 如果是移动端，显示提示信息
    if (isMobile) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Command className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold">
                                快捷键仅支持桌面端
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                请在电脑上访问以学习和使用键盘快捷键
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 
                                rounded-lg text-sm font-medium transition-colors 
                                hover:bg-gray-800 dark:hover:bg-gray-200"
                        >
                            我知道了
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={onClose}
            aria-modal={!isLearningMode}
        >
            <DialogContent 
                showClose={false}
                className="max-w-4xl p-0 outline-none"
                role={isLearningMode ? "none" : "dialog"}
                tabIndex={isLearningMode ? undefined : 0}
                onKeyDown={e => e.stopPropagation()}
                onKeyUp={e => e.stopPropagation()}
            >
                {!isLearningMode ? (
                    <div className="h-[570px] flex flex-col">
                        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Command className="w-5 h-5" />
                                    <h2 className="text-lg font-semibold">快捷键学习中心</h2>
                                </div>
                                <ProgressDisplay completionRate={completionRate} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {SHORTCUT_CATEGORIES.map(({ id, title, shortcuts }) => {
                                    const completedCount = shortcuts.filter(
                                        s => progress.some(p => p.id === s && p.completed)
                                    ).length

                                    return (
                                        <div key={id} className="space-y-4">
                                            <h3 className="flex items-center justify-between text-sm font-semibold">
                                                <span>{title}</span>
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                                    {completedCount}/{shortcuts.length}
                                                </span>
                                            </h3>
                                            <div className="space-y-3">
                                                {shortcuts.map(shortcutKey => (
                                                    <ShortcutButton
                                                        key={shortcutKey}
                                                        shortcutKey={shortcutKey}
                                                        isCompleted={progress.some(p => p.id === shortcutKey && p.completed)}
                                                        onClick={() => handleShortcutSelect(shortcutKey)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-[570px] flex flex-col">
                        <div className="flex-1 flex items-center justify-center px-6">
                            <ShortcutLearningMode 
                                shortcutKey={currentShortcut!}
                                onComplete={handleComplete}
                            />
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default React.memo(ShortcutsModal)