"use client"

import dynamic from 'next/dynamic'
import { useToast } from "@/hooks/use-toast"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import React from 'react'
import { cn } from '@/lib/utils'

const Toast = dynamic(() => import('@/components/ui/toast').then(mod => mod.Toast), {
  ssr: false
})
const ToastTitle = dynamic(() => import('@/components/ui/toast').then(mod => mod.ToastTitle), {
  ssr: false
})
const ToastDescription = dynamic(() => import('@/components/ui/toast').then(mod => mod.ToastDescription), {
  ssr: false
})

export const Toaster = React.memo(function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, acceptButton, quitButton, ...props }) {
        const hasBoth = Boolean(title && description)
        
        const handleAcceptClick = () => {
          acceptButton?.onClick()
          dismiss(id)
        }

        const handleQuitClick = () => {
          quitButton?.onClick()
          dismiss(id)
        }
        
        return (
          <Toast key={id} {...props}>
            <div className="flex flex-col w-full">
              <div className={cn(
                "flex min-h-[48px]",
                hasBoth ? "flex-col gap-1.5" : "items-center"
              )}>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {(acceptButton || quitButton) && (
                <div className="flex justify-end items-center gap-2 mt-2">
                  {quitButton && (
                    <button
                      onClick={handleQuitClick}
                      className="inline-flex items-center justify-center px-3 h-8 text-xs font-medium text-gray-700 transition-colors bg-transparent border border-gray-200 rounded-md hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      {quitButton.label}
                    </button>
                  )}
                  {acceptButton && (
                    <button
                      onClick={handleAcceptClick}
                      className="inline-flex items-center justify-center px-3 h-8 text-xs font-medium text-white transition-colors bg-gray-900 rounded-md hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                      {acceptButton.label}
                    </button>
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

Toaster.displayName = 'Toaster'