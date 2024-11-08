"use client"

import dynamic from 'next/dynamic'
import { useToast } from "@/hooks/use-toast"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import React from 'react'

// 懒加载Toast相关组件
const Toast = dynamic(() => import('@/components/ui/toast').then(mod => mod.Toast), {
  ssr: false
})
const ToastTitle = dynamic(() => import('@/components/ui/toast').then(mod => mod.ToastTitle), {
  ssr: false
})
const ToastDescription = dynamic(() => import('@/components/ui/toast').then(mod => mod.ToastDescription), {
  ssr: false
})

// 使用memo优化Toaster组件
export const Toaster = React.memo(function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-center justify-center text-center flex-grow">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
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
