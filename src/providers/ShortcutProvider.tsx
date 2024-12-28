'use client'

import React, { createContext, useContext } from 'react'
import { useShortcuts } from '../hooks/features/useShortcuts'
import type { ShortcutManager } from '@/types/shortcuts'

const ShortcutContext = createContext<ShortcutManager | null>(null)

/**
 * ShortcutProvider 组件用于提供快捷键管理上下文。
 * 
 * @param {Object} props - 组件的属性
 * @param {React.ReactNode} props.children - 子组件
 * @returns {JSX.Element} 返回包含快捷键管理上下文的组件
 */
export function ShortcutProvider({ children }: { children: React.ReactNode }) {
  const shortcutManager = useShortcuts()

  return (
    <ShortcutContext.Provider value={shortcutManager}>
      {children}
    </ShortcutContext.Provider>
  )
}

/**
 * useShortcutManager 自定义 Hook，用于访问快捷键管理上下文。
 * 
 * @throws {Error} 如果在 ShortcutProvider 之外使用，将抛出错误
 * @returns {ShortcutManager} 返回快捷键管理实例
 */
export function useShortcutManager() {
  const context = useContext(ShortcutContext)
  if (!context) {
    throw new Error('useShortcutManager must be used within ShortcutProvider')
  }
  return context
}