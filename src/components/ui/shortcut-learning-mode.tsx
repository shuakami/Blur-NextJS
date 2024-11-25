"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { SHORTCUTS, SHORTCUT_DESCRIPTIONS } from '@/constants/shortcuts'

interface LearningModeProps {
    shortcutKey: string
    onComplete: (success: boolean) => void
}

export const ShortcutLearningMode: React.FC<LearningModeProps> = ({ shortcutKey, onComplete }) => {
    const [attempts, setAttempts] = useState(0)
    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
    const [isError, setIsError] = useState(false)
    const [showTutorial, setShowTutorial] = useState(false)
    const shortcut = SHORTCUTS[shortcutKey as keyof typeof SHORTCUTS]
    const description = SHORTCUT_DESCRIPTIONS[shortcutKey as keyof typeof SHORTCUT_DESCRIPTIONS]

    useEffect(() => {
        const SEQUENCE_TIMEOUT = 2000

        const normalizeKey = (key: string) => {
            const keyMap: Record<string, string> = {
                'control': 'ctrl',
                'meta': 'command',
                'escape': 'esc',
                ' ': 'space',
                'arrowup': 'up',
                'arrowdown': 'down',
                'arrowleft': 'left',
                'arrowright': 'right',
                'delete': 'del',
                'backspace': 'backspace',
                'enter': 'enter',
                'tab': 'tab',
                'capslock': 'capslock',
                'shift': 'shift',
                'alt': 'alt',
                'return': 'enter',
                'insert': 'ins',
                'pageup': 'pgup',
                'pagedown': 'pgdn',
                'home': 'home',
                'end': 'end',
            }
            return keyMap[key.toLowerCase()] || key.toLowerCase()
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            e.stopPropagation()
            e.preventDefault()
            const normalizedKey = normalizeKey(e.key)
            setActiveKeys(prev => new Set(prev).add(normalizedKey))
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            e.stopPropagation()
            e.preventDefault()
            const normalizedKey = normalizeKey(e.key)
            setActiveKeys(prev => {
                const newKeys = new Set(prev)
                newKeys.delete(normalizedKey)
                return newKeys
            })
        }

        const checkShortcut = () => {
            const targetKeys = new Set(shortcut.toLowerCase().split('+').map(k => normalizeKey(k.trim())))
            const currentKeys = new Set(Array.from(activeKeys))

            // 检查是否所有目标按键都被按住
            const isCorrect = 
                targetKeys.size === currentKeys.size && 
                Array.from(targetKeys).every(key => currentKeys.has(key))

            if (currentKeys.size === targetKeys.size && !isCorrect) {
                setIsError(true)
                setAttempts(prev => prev + 1)
                toast({
                    variant: "destructive",
                    title: "按键组合不正确",
                    description: "请确保同时按住所有所需按键",
                })
                setTimeout(() => setIsError(false), 1000)
            } else if (isCorrect) {
                onComplete(true)
            }
        }

        document.body.focus()
        document.addEventListener('keydown', handleKeyDown, { capture: true })
        document.addEventListener('keyup', handleKeyUp, { capture: true })
        
        // 每当活动键发生变化时检查快捷键
        const checkTimeout = setTimeout(checkShortcut, 100)
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown, { capture: true })
            document.removeEventListener('keyup', handleKeyUp, { capture: true })
            clearTimeout(checkTimeout)
        }
    }, [shortcut, activeKeys, onComplete])

    // 添加一个函数来判断快捷键类型
    const getShortcutType = (keys: string[]) => {
        if (keys.length === 1) return 'single'
        if (keys.length === 2 && keys[0] === keys[1]) return 'double'
        return 'combination'
    }

    // 获取操作说明文本
    const getActionText = () => {
        const keys = shortcut.split('+')
        const type = getShortcutType(keys)
        
        switch (type) {
            case 'single':
                return '按下按键'
            case 'double':
                return '快速按下按键两次'
            case 'combination':
                return '按下组合键'
        }
    }

    // 添加一个函数来格式化按键显示
    const formatKeyDisplay = (key: string) => {
        const keyDisplayMap: Record<string, string> = {
            'up': '↑ (方向键/小键盘)',
            'down': '↓ (方向键/小键盘)',
            'left': '← (方向键/小键盘)',
            'right': '→ (方向键/小键盘)',
        }
        return keyDisplayMap[key.toLowerCase()] || key
    }

    // 如果在教程模式，显示教程界面
    if (showTutorial) {
        const keys = shortcut.split('+')
        const shortcutType = getShortcutType(keys)

        return (
            <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 animate-in fade-in-0 duration-200">
                {/* 顶部导航 */}
                <div className="absolute top-0 left-0 right-0 p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between max-w-3xl mx-auto">
                        <button 
                            onClick={() => setShowTutorial(false)}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">返回练习</span>
                        </button>
                    </div>
                </div>

                <div className="h-full pt-16 pb-8 overflow-auto">
                    <div className="max-w-2xl mx-auto p-6 space-y-10">
                        {/* 标题 */}
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {description}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {shortcutType === 'double' ? '快速按下按键两次' : '试试按下下面的按键'}
                            </p>
                        </div>

                        {/* 快捷键演示 */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                            <div className="flex justify-center gap-3">
                                {shortcutType === 'double' ? (
                                    <kbd className={`px-4 py-3 text-base bg-white dark:bg-gray-900 
                                        border rounded-md shadow-sm font-medium transition-all duration-200
                                        ${activeKeys.has(keys[0].toLowerCase())
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 scale-105' 
                                            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
                                    >
                                        {keys[0]} × 2
                                    </kbd>
                                ) : (
                                    keys.map((key, i) => (
                                        <React.Fragment key={i}>
                                            <kbd className={`px-4 py-3 text-base bg-white dark:bg-gray-900 
                                                border rounded-md shadow-sm font-medium transition-all duration-200
                                                ${activeKeys.has(key.toLowerCase())
                                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 scale-105' 
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
                                            >
                                                {key}
                                            </kbd>
                                            {shortcutType === 'combination' && i < keys.length - 1 && (
                                                <span className="text-sm font-medium text-gray-400 dark:text-gray-500 self-center">
                                                    +
                                                </span>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 说明部分根据类型显示不同内容 */}
                        {shortcutType === 'single' ? (
                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    直接按下 <kbd className="px-2 py-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">{keys[0]}</kbd> 键即可
                                </p>
                            </div>
                        ) : shortcutType === 'double' ? (
                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    连续快速按下 <kbd className="px-2 py-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">{keys[0]}</kbd> 键两次
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="relative pl-8 pb-8 border-l border-gray-200 dark:border-gray-700">
                                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <div className="space-y-1">
                                        <h3 className="font-medium">第一步：按住修饰键</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            按住 {keys.slice(0, -1).join('、')} 键不要松开
                                        </p>
                                    </div>
                                </div>

                                <div className="relative pl-8 border-l border-gray-200 dark:border-gray-700">
                                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <div className="space-y-1">
                                        <h3 className="font-medium">第二步：按下主键</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            保持按住修饰键，同时按下 {formatKeyDisplay(keys.slice(-1)[0])}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 底部按钮 */}
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={() => setShowTutorial(false)}
                                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium 
                                    transition-colors hover:bg-gray-800 dark:hover:bg-gray-200"
                            >
                                返回练习
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] py-8">
            <button 
                onClick={() => onComplete(false)}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="sr-only">返回列表</span>
            </button>
            
            <div className="text-center space-y-8 max-w-3xl w-full mx-auto">
                <div className="space-y-2">
                    <h3 className="text-lg font-medium">{description}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {getActionText()}
                    </p>
                </div>
                
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center justify-center gap-3">
                        {shortcut.split('+').map((key, i) => (
                            <React.Fragment key={i}>
                                <kbd className={`px-3 py-2 text-base bg-white dark:bg-gray-900 
                                    border-2 rounded-md shadow-sm font-medium transition-all duration-200
                                    ${activeKeys.has(key.toLowerCase())
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 scale-105' 
                                        : isError
                                            ? 'border-red-400 text-red-500 dark:text-red-400'
                                            : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    {key.toLowerCase() === 'up' || key.toLowerCase() === 'down' || 
                                     key.toLowerCase() === 'left' || key.toLowerCase() === 'right' 
                                        ? formatKeyDisplay(key)
                                        : key
                                    }
                                </kbd>
                                {i < shortcut.split('+').length - 1 && (
                                    <span className="text-sm font-medium text-gray-400">+</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        {attempts > 0 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3">
                                <span>尝试次数：<span className="font-medium">{attempts}</span></span>
                                {attempts >= 2 && (
                                    <button
                                        onClick={() => setShowTutorial(true)}
                                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-600 dark:text-gray-400"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                        <span className="text-sm">查看教程</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}