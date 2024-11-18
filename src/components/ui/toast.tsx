"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// 抽离基础组件
const ToastProvider = ToastPrimitives.Provider

// 抽离视口样式
const viewportStyles = "fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 md:max-w-[380px]"

// 优化 Viewport 组件
const ToastViewport = React.memo(React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(viewportStyles, className)}
    {...props}
  />
)))

// 抽离变体样式到单独的对象
const baseStyles = {
  default: "border-gray-100 text-gray-950 bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50",
  destructive: "border-gray-100 bg-white text-gray-950 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50",
  success: "border-gray-100 bg-white text-gray-950 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50",
  info: "border-gray-100 bg-white text-gray-950 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50",
  warning: "border-gray-100 bg-white text-gray-950 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50",
} as const

// 抽离主题样式到单独的对象
const themeStyles = {
  mc: `
    relative
    border-[3px] border-black 
    bg-[#c6c6c6] text-black
    shadow-[inset_-2px_-4px_0_0_#555555,inset_2px_2px_0_0_#ffffff]
    dark:bg-[#373737] dark:text-white dark:border-[#6a6a6a]
    dark:shadow-[inset_-2px_-4px_0_0_#272727,inset_2px_2px_0_0_#8b8b8b]
    
    [&>h2]:font-mc [&>h2]:text-base [&>h2]:mb-1
    [&>div]:font-mc [&>div]:text-sm
    
    [&>button[toast-close]]:absolute [&>button[toast-close]]:right-1 [&>button[toast-close]]:top-1
    [&>button[toast-close]]:w-6 [&>button[toast-close]]:h-6
    [&>button[toast-close]]:border-[2px] [&>button[toast-close]]:border-black
    [&>button[toast-close]]:bg-[#c6c6c6]
    [&>button[toast-close]]:shadow-[inset_-2px_-2px_0_0_#555555,inset_2px_2px_0_0_#ffffff]
    [&>button[toast-close]]:hover:bg-[#aeaeae]
    [&>button[toast-close]]:active:shadow-[inset_2px_2px_0_0_#555555]
    [&>button[toast-close]]:dark:bg-[#373737]
    [&>button[toast-close]]:dark:border-[#6a6a6a]
    [&>button[toast-close]]:dark:shadow-[inset_-2px_-2px_0_0_#272727,inset_2px_2px_0_0_#8b8b8b]
    [&>button[toast-close]]:dark:hover:bg-[#2b2b2b]
    
    [&_button[data-button]]:px-4 [&_button[data-button]]:h-8
    [&_button[data-button]]:border-[2px] [&_button[data-button]]:border-black
    [&_button[data-button]]:bg-[#c6c6c6]
    [&_button[data-button]]:shadow-[inset_-2px_-2px_0_0_#555555,inset_2px_2px_0_0_#ffffff]
    [&_button[data-button]]:hover:bg-[#aeaeae]
    [&_button[data-button]]:active:shadow-[inset_2px_2px_0_0_#555555]
    [&_button[data-button]]:dark:bg-[#373737]
    [&_button[data-button]]:dark:border-[#6a6a6a]
    [&_button[data-button]]:dark:shadow-[inset_-2px_-2px_0_0_#272727,inset_2px_2px_0_0_#8b8b8b]
    [&_button[data-button]]:dark:hover:bg-[#2b2b2b]
    
    [&_.toast-buttons]:mt-3 [&_.toast-buttons]:flex [&_.toast-buttons]:gap-2 [&_.toast-buttons]:justify-end
  `,
  cyberpunk: `
    relative overflow-visible
    border-l-[3px] border-[#00F0FF]
    bg-black/90 text-[#00F0FF]
    backdrop-blur-md
    
    before:absolute before:content-['']
    before:left-[-2px] before:top-0
    before:h-full before:w-[3px]
    before:bg-[#00F0FF]
    before:shadow-[0_0_20px_#00F0FF]
    before:animate-pulse
    
    after:absolute after:content-['']
    after:top-0 after:right-0
    after:h-[3px] after:w-[60px]
    after:bg-[#F6F91B]
    after:shadow-[0_0_20px_#F6F91B]
    
    [&>h2]:font-mono [&>h2]:text-lg [&>h2]:tracking-wider [&>h2]:uppercase
    [&>h2]:mb-3 [&>h2]:text-[#F6F91B]
    [&>h2]:border-b [&>h2]:border-[#F6F91B]/30
    [&>h2]:pb-2
    
    [&>div]:font-mono [&>div]:text-sm [&>div]:text-[#00F0FF]/90
    [&>div]:leading-relaxed
    
    [&>button[toast-close]]:absolute [&>button[toast-close]]:right-2 [&>button[toast-close]]:top-2
    [&>button[toast-close]]:w-6 [&>button[toast-close]]:h-6
    [&>button[toast-close]]:text-[#F6F91B]
    [&>button[toast-close]]:opacity-60
    [&>button[toast-close]]:hover:opacity-100
    [&>button[toast-close]]:transition-opacity
    [&>button[toast-close]]:hover:shadow-[0_0_10px_#F6F91B]
    
    [&_button[data-button]]:px-6 [&_button[data-button]]:h-9
    [&_button[data-button]]:font-mono [&_button[data-button]]:text-sm
    [&_button[data-button]]:uppercase [&_button[data-button]]:tracking-widest
    [&_button[data-button]]:border-2 [&_button[data-button]]:border-[#00F0FF]
    [&_button[data-button]]:bg-black/50
    [&_button[data-button]]:text-[#00F0FF]
    [&_button[data-button]]:transition-all
    [&_button[data-button]]:hover:bg-[#00F0FF]/10
    [&_button[data-button]]:hover:shadow-[0_0_15px_#00F0FF]
    [&_button[data-button]]:hover:border-[#F6F91B]
    [&_button[data-button]]:hover:text-[#F6F91B]
    [&_button[data-button]]:active:translate-y-[2px]
    
    [&_.toast-buttons]:mt-4 [&_.toast-buttons]:flex [&_.toast-buttons]:gap-3 [&_.toast-buttons]:justify-end
  `,
} as const

const variantStyles = {
  ...baseStyles,
  ...themeStyles,
} as const

// 优化 Toast variants
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full overflow-hidden rounded-lg border bg-white/95 p-4 shadow-sm transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full",
  {
    variants: {
      variant: variantStyles,
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// 类型定义
interface ToastButtonProps {
  acceptButton?: {
    label: string;
    onClick: () => void;
  };
  quitButton?: {
    label: string;
    onClick: () => void;
  };
}

// 优化 Toast 按钮组件
const ToastButtons = React.memo(function ToastButtons({ 
  acceptButton, 
  quitButton 
}: ToastButtonProps) {
  if (!acceptButton && !quitButton) return null;
  
  return (
    <div className="toast-buttons">
      {quitButton && (
        <button
          data-button=""
          onClick={quitButton.onClick}
          className="font-mc"
        >
          {quitButton.label}
        </button>
      )}
      {acceptButton && (
        <button
          data-button=""
          onClick={acceptButton.onClick}
          className="font-mc"
        >
          {acceptButton.label}
        </button>
      )}
    </div>
  );
})

// 优化主 Toast 组件
const Toast = React.memo(React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> &
    ToastButtonProps
>(({ className, variant, acceptButton, quitButton, children, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  >
    {children}
    <ToastButtons acceptButton={acceptButton} quitButton={quitButton} />
  </ToastPrimitives.Root>
)))

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-none p-1",
      "opacity-100 transition-all",
      "focus:outline-none",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-3 w-3" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-[15px] font-semibold [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm leading-relaxed text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  type ToastButtonProps,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
