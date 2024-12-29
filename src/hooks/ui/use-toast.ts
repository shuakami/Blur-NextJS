// use-toast.ts
"use client"

import { toast as sonnerToast, type ExternalToast } from 'sonner'
import type { ToastProps } from "@/components/ui/toast"

// 类型定义
type ToasterToast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactElement
}

type Toast = Omit<ToasterToast, "id">

// 创建toast函数
function toast(props: Toast) {
    const {
        title,
        description,
        variant = "default",
        acceptButton,
        quitButton,
        ...restProps
    } = props

    // 构建按钮组
    const action = acceptButton ? {
        label: acceptButton.label,
        onClick: acceptButton.onClick
    } : undefined

    const cancel = quitButton ? {
        label: quitButton.label,
        onClick: quitButton.onClick
    } : undefined

    // 使用Sonner的toast
    const options: ExternalToast = {
        description: description as string,
        action,
        cancel,
        ...restProps
    }

    // 根据variant设置不同的toast类型
    if (variant === 'destructive') {
        return sonnerToast.error(title as string, options)
    } else if (variant === 'success') {
        return sonnerToast.success(title as string, options)
    } else if (variant === 'warning') {
        return sonnerToast.warning(title as string, options)
    } else if (variant === 'info') {
        return sonnerToast.info(title as string, options)
    } else {
        return sonnerToast(title as string, options)
    }
}

// Hook
function useToast() {
    return {
        toast,
        dismiss: sonnerToast.dismiss
    }
}

export { useToast, toast }
