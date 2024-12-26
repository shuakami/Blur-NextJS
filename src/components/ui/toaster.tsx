// src/components/ui/Toaster.tsx

"use client"

import dynamic from 'next/dynamic'
import { useToast } from '@/hooks/ui/use-toast'
import { ToastProvider, ToastViewport, Toast, ToastClose } from "@/components/ui/toast"
import React, { useCallback, memo, useMemo } from 'react'
import { cn } from '@/lib/utils/utils'

const ToastTitle = dynamic(() => import('@/components/ui/toast').then(mod => mod.ToastTitle), {
  ssr: false
})
const ToastDescription = dynamic(() => import('@/components/ui/toast').then(mod => mod.ToastDescription), {
  ssr: false
})

interface ToastContentProps {
  title?: string
  description?: string
  hasBoth: boolean
}

const ToastContent: React.FC<ToastContentProps> = memo(({ title, description }) => {
  return (
    <div className={cn(
      "flex",
      (title && description) ? "flex-col gap-1.5 min-h-[48px]" : (title || description) ? "items-center" : ""
    )}>
      {title && (
        <ToastTitle className="text-sm">
          {title}
        </ToastTitle>
      )}
      {description && (
        <ToastDescription className="text-sm">
          {description}
        </ToastDescription>
      )}
    </div>
  )
})


ToastContent.displayName = 'ToastContent'

type ToastVariant = "default" | "destructive" | "success" | "info" | "warning";

interface ToastItemProps {
  id: string
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
  acceptButton?: { onClick: () => void, label: string }
  quitButton?: { onClick: () => void, label: string }
  position?: number
  open?: boolean
  dismiss: (id: string) => void
  variant?: ToastVariant
  className?: string
  isRemoving?: boolean
}

const ToastItem: React.FC<ToastItemProps> = memo(({
  id, title, description, action, acceptButton, quitButton, position, open, dismiss, ...props
}) => {
  const hasBoth = useMemo(() => Boolean(title && description), [title, description])
  const isRemoving = !open

  const createHandleClick = useCallback((onClick?: () => void) => () => {
    console.log(`[Toaster] Removing toast: ${id}`)
    if (onClick) {
      try {
        onClick()
      } catch (error) {
        console.error(`[Toaster] Error in onClick handler for toast ${id}:`, error)
      }
    }
    dismiss(id)
  }, [id, dismiss])

  return (
    <Toast 
      {...props}
      position={isRemoving ? undefined : position}
      isRemoving={isRemoving}
      className={cn(
        "group relative flex flex-col",
        !description && !acceptButton && !quitButton ? "py-6" : "min-h-[48px]",
        props.className,
        "transform transition-transform duration-300 will-change-transform"
      )}
      acceptButton={acceptButton ? {
        onClick: createHandleClick(acceptButton.onClick),
        label: acceptButton.label
      } : undefined}
      quitButton={quitButton ? {
        onClick: createHandleClick(quitButton.onClick),
        label: quitButton.label
      } : undefined}
    >
      <ToastClose 
        className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => dismiss(id)}
      />
      <ToastContent 
        title={title}
        description={description as string | undefined}
        hasBoth={hasBoth}
      />
      {action}
    </Toast>
  )
})

ToastItem.displayName = 'ToastItem'

class ToasterErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Toaster encountered an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500">Something went wrong with the Toaster.</div>
    }

    return this.props.children
  }
}

const Toaster: React.FC = memo(() => {
  const { toasts, dismiss } = useToast()

  return (
    <ToasterErrorBoundary>
      <ToastProvider swipeDirection="right">
        {toasts.map((toast) => {
          const toastProps: ToastItemProps = {
            ...toast,
            variant: (toast.variant as ToastVariant) || "default",
            dismiss
          }
          return <ToastItem key={toast.id} {...toastProps} />
        })}
        <ToastViewport />
      </ToastProvider>
    </ToasterErrorBoundary>
  )
})

Toaster.displayName = 'Toaster'

export { Toaster }
