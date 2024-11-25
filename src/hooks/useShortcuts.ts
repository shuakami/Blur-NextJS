'use client'

import { useCallback, useEffect, useRef } from 'react'
import Mousetrap from 'mousetrap'
import type { ShortcutConfig, ShortcutCommand } from '@/types/shortcuts'

export function useShortcuts() {
  // 使用 ref 存储注册的快捷键配置，避免重复注册
  const registeredShortcuts = useRef<Map<ShortcutCommand, ShortcutConfig>>(new Map())
  
  // 使用 ref 存储防抖的处理函数
  const handlerDebounceTimers = useRef<Map<ShortcutCommand, NodeJS.Timeout>>(new Map())

  // 添加一个禁用状态的 ref
  const isDisabled = useRef(false)

  // 添加一个新的 ref 来跟踪 Shift 键的状态
  const shiftKeyState = useRef({
    lastPressed: 0,
    count: 0
  })

  useEffect(() => {
    Mousetrap.prototype.stopCallback = function(e: any, element: { className: string; tagName: string }) {
      // 如果快捷键系统被禁用，直接返回 true 阻止所有快捷键
      if (isDisabled.current) {
        return true
      }

      // 如果元素有 mousetrap-stop 类，则停止处理
      if ((' ' + element.className + ' ').indexOf(' mousetrap-stop ') > -1) {
        return true
      }

      // 特殊处理 '/' 快捷键
      if (e.key === '/' || e.key === 'Slash') {
        const config = registeredShortcuts.current.get('FOCUS_CHAT')
        return !(config?.condition?.(e) ?? true)
      }

      // 在这些标签中停止处理
      return element.tagName === 'INPUT' || 
             element.tagName === 'SELECT' || 
             element.tagName === 'TEXTAREA'
    }

    // 添加对双击 Shift 的特殊处理
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        const now = Date.now()
        const timeDiff = now - shiftKeyState.current.lastPressed
        
        // 如果在 200ms 内按下 Shift
        if (timeDiff < 300) {
          shiftKeyState.current.count++
          
          // 如果是双击 Shift
          if (shiftKeyState.current.count === 2) {
            const config = registeredShortcuts.current.get('TOGGLE_COMMAND_CENTER')
            if (config && (!config.condition || config.condition(e))) {
              e.preventDefault()
              config.handler()
            }
            // 重置计数
            shiftKeyState.current.count = 0
          }
        } else {
          // 超时，重置计数
          shiftKeyState.current.count = 1
        }
        
        shiftKeyState.current.lastPressed = now
      } else {
        // 按下其他键时重置 Shift 状态
        shiftKeyState.current.count = 0
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'Shift') {
        // 松开非 Shift 键时重置状态
        shiftKeyState.current.count = 0
      }
    }

    // 添加事件监听器
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    // 清理函数
    return () => {
      // 清理所有防抖定时器
      handlerDebounceTimers.current.forEach(timer => clearTimeout(timer))
      handlerDebounceTimers.current.clear()
      
      // 解绑所有快捷键
      registeredShortcuts.current.forEach((_, command) => {
        Mousetrap.unbind(command.toLowerCase())
      })
      registeredShortcuts.current.clear()
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const register = useCallback((config: ShortcutConfig) => {
    if (typeof window === 'undefined') return

    // 存储配置
    registeredShortcuts.current.set(config.command, config)
    
    // 如果不是双击 Shift，则使用 Mousetrap 注册
    if (config.key.toLowerCase() !== 'shift+shift') {
      Mousetrap.bind(config.key.toLowerCase(), (e) => {
        const prevTimer = handlerDebounceTimers.current.get(config.command)
        if (prevTimer) clearTimeout(prevTimer)

        const timer = setTimeout(() => {
          if (!config.condition || config.condition(e)) {
            e.preventDefault()
            config.handler()
          }
        }, 100)

        handlerDebounceTimers.current.set(config.command, timer)
        return false
      })
    }
  }, [])

  const unregister = useCallback((command: ShortcutCommand) => {
    if (typeof window === 'undefined') return

    const config = registeredShortcuts.current.get(command)
    if (config) {
      // 如果不是双击 Shift，则使用 Mousetrap 解绑
      if (config.key.toLowerCase() !== 'shift+shift') {
        Mousetrap.unbind(config.key.toLowerCase())
      }
      registeredShortcuts.current.delete(command)
    }

    const timer = handlerDebounceTimers.current.get(command)
    if (timer) {
      clearTimeout(timer)
      handlerDebounceTimers.current.delete(command)
    }
  }, [])

  // 添加临时禁用和启用的方法
  const setDisabled = useCallback((disabled: boolean) => {
    isDisabled.current = disabled
  }, [])

  return {
    register,
    unregister,
    setDisabled,  // 导出新方法
    handleKeyDown: useCallback((event: KeyboardEvent) => {
      // 保留扩展性
    }, [])
  }
}