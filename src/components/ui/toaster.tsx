"use client"

import dynamic from 'next/dynamic'
import { useToast } from '../../hooks/ui/use-toast'
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import React, { useCallback, useMemo } from 'react'
import { cn } from '../../lib/utils/utils'

const Toast = dynamic(() => import('@/components/ui/toast').then(mod => mod.Toast), {
  ssr: false
})
const ToastTitle = dynamic(() => import('@/components/ui/toast').then(mod => mod.ToastTitle), {
  ssr: false
})
const ToastDescription = dynamic(() => import('@/components/ui/toast').then(mod => mod.ToastDescription), {
  ssr: false
})

// 按钮样式配置
const BUTTON_STYLES = {
  default: {
    quit: "px-3 text-gray-700 bg-transparent border border-gray-200 rounded-md hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800",
    accept: "px-3 text-white bg-gray-900 rounded-md hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
  },
  mc: {
    base: "px-4 font-mc border-[2px] border-black bg-[#c6c6c6] shadow-[inset_-2px_-2px_0_0_#555555,inset_2px_2px_0_0_#ffffff] hover:bg-[#aeaeae] active:shadow-[inset_2px_2px_0_0_#555555] dark:bg-[#373737] dark:border-[#6a6a6a] dark:shadow-[inset_-2px_-2px_0_0_#272727,inset_2px_2px_0_0_#8b8b8b] dark:hover:bg-[#2b2b2b]"
  },
  cyberpunk: {
    quit: "px-6 h-9 font-mono uppercase tracking-widest border-2 border-[#00F0FF] bg-black/50 text-[#00F0FF] hover:bg-[#00F0FF]/10 hover:shadow-[0_0_6px_#00F0FF] hover:text-[#F6F91B] active:translate-y-[2px]",
    accept: "px-6 h-9 font-mono uppercase tracking-widest border-2 border-[#F6F91B] bg-black/50 text-[#F6F91B] hover:bg-[#F6F91B]/10 hover:shadow-[0_0_6px_#F6F91B] hover:text-[#00F0FF] active:translate-y-[2px]"
  }
} as const

// 按钮组件
const ToastButton = React.memo(function ToastButton({ 
  onClick, 
  variant, 
  type,
  label 
}: { 
  onClick: () => void
  variant: string
  type: 'quit' | 'accept'
  label: string 
}) {
  const buttonStyle = useMemo(() => {
    if (variant === 'mc') return BUTTON_STYLES.mc.base
    if (variant === 'cyberpunk') return BUTTON_STYLES.cyberpunk[type]
    return BUTTON_STYLES.default[type]
  }, [variant, type])

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center h-8 text-xs font-medium transition-all",
        buttonStyle
      )}
    >
      {label}
    </button>
  )
})

// Toast 内容
const ToastContent = React.memo(function ToastContent({
  title,
  description,
  hasBoth
}: {
  title?: string
  description?: string
  hasBoth: boolean
}) {
  return (
    <div className={cn(
      "flex",
      hasBoth ? "flex-col gap-1.5 min-h-[48px]" : "items-center h-10"
    )}>
      {title && (
        <ToastTitle className={cn(
          "text-sm",
          !description && cn(
            "flex items-center font-medium tracking-tight",
            "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700",
            "dark:from-neutral-100 dark:via-neutral-200 dark:to-neutral-300",
            "bg-clip-text text-transparent"
          )
        )}>
          {!description && (
            <span className="flex items-center mr-2 text-neutral-500 dark:text-neutral-400">
              <span className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-500" />
            </span>
          )}
          {title}
        </ToastTitle>
      )}
      {description && (
        <ToastDescription className="text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </ToastDescription>
      )}
    </div>
  )
})

export const Toaster = React.memo(function Toaster() {
  const { toasts, dismiss } = useToast()

  const createHandleClick = useCallback((id: string, onClick?: () => void) => () => {
    onClick?.()
    dismiss(id)
  }, [dismiss])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, acceptButton, quitButton, ...props }) {
        const hasBoth = Boolean(title && description)
        
        return (
          <Toast 
            key={id} 
            {...props}
            className={cn(
              "group",
              !description && !acceptButton && !quitButton ? "h-10 py-0" : "min-h-[48px]",
              props.className
            )}
          >
            <div className={cn(
              "flex flex-col w-full",
              !description && !acceptButton && !quitButton && "justify-center"
            )}>
              <ToastContent 
                title={title}
                description={description as string}
                hasBoth={hasBoth}
              />
              {(acceptButton || quitButton) && (
                <div className="flex justify-end items-center gap-2 mt-2">
                  {quitButton && (
                    <ToastButton
                      onClick={createHandleClick(id, quitButton.onClick)}
                      variant={props.variant as string}
                      type="quit"
                      label={quitButton.label}
                    />
                  )}
                  {acceptButton && (
                    <ToastButton
                      onClick={createHandleClick(id, acceptButton.onClick)}
                      variant={props.variant as string}
                      type="accept"
                      label={acceptButton.label}
                    />
                  )}
                </div>
              )}
            </div>
            {action}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
})

ToastButton.displayName = 'ToastButton'
ToastContent.displayName = 'ToastContent'
Toaster.displayName = 'Toaster'