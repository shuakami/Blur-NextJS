"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from '@/lib/utils/utils'
import { Button } from "./button"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"

interface ToastButtonProps {
  acceptButton?: {
    label: string
    onClick: () => void
  }
  quitButton?: {
    label: string
    onClick: () => void
  }
}

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

// 样式常量
const STYLES = {
  viewport: {
    base: cn(
      "fixed z-[100] flex flex-col gap-2 p-4",
      "w-full md:max-w-[420px]",
      "bottom-0 right-0",
      "[--hover:0] hover:[--hover:1]",
      "transition-[--hover] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
    )
  },
  variants: {
    default: cn(
      "bg-white text-gray-900",
      "dark:bg-black dark:text-gray-100",
      "border border-gray-100 dark:border-gray-900"
    ),
    destructive: cn(
      "bg-rose-600 text-white font-semibold",
      "border border-rose-600"
    ),
    success: cn(
      "bg-green-500 text-white font-semibold",
      "border border-green-500"
    ),
    info: cn(
      "bg-blue-500 text-white font-semibold",
      "border border-blue-500"
    ),
    warning: cn(
      "bg-yellow-400 text-gray-900 font-semibold",
      "border border-yellow-400"
    ),
  },
} as const

// Toast variants
const toastVariants = cva(
  cn(
    "group pointer-events-auto relative w-full",
    "p-5 rounded-xl backdrop-blur-sm overflow-hidden",
    "transform-gpu will-change-[transform,opacity]",
    "motion-safe:transition-all      motion-safe:duration-500",
    "motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]",
    
    // Animations
    "data-[state=open]:animate-in data-[state=open]:fade-in-0",
    "data-[state=open]:slide-in-from-bottom-full",
    "data-[state=open]:duration-500",
    "data-[state=open]:ease-[cubic-bezier(0.22,1,0.36,1)]",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
    "data-[state=closed]:slide-out-to-bottom-4",
    "data-[state=closed]:duration-300 data-[state=closed]:ease-in",
   
    // Swipe
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:transition-none",
    
    // Responsive & Visual
    "max-w-[min(420px,calc(100vw-2rem))]",
    "shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
    "dark:shadow-[0_8px_24px_rgba(0,0,0,0.25)]",
    "before:absolute before:inset-0 before:rounded-xl",
    "before:shadow-[0_-1px_5px_rgba(0,0,0,0.05)]",
    "before:opacity-0 before:transition-opacity before:duration-500",
    "before:-z-10",
    "group-hover:before:opacity-100",
    "dark:before:shadow-[0_-1px_5px_rgba(0,0,0,0.2)]",
    "transition-shadow duration-500"
  ),
  {
    variants: {
      variant: STYLES.variants,
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// 基础组件
const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.memo(React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
<LayoutGroup>
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(STYLES.viewport.base, className)}
    {...props}
  />
  </LayoutGroup>
)))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

// Toast 按钮组件
const ToastButtons = React.memo(function ToastButtons({ 
    acceptButton, 
    quitButton 
  }: ToastButtonProps) {
    if (!acceptButton && !quitButton) return null
    
    return (
      <div className="w-full flex justify-end items-center gap-2 mt-2">
        {quitButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={quitButton.onClick}
          >
            {quitButton.label}
          </Button>
        )}
        {acceptButton && (
          <Button
            variant="default"
            size="sm"
            onClick={acceptButton.onClick}
          >
            {acceptButton.label}
          </Button>
        )}
      </div>
    )
  })  
ToastButtons.displayName = 'ToastButtons'

// Toast 主组件
const Toast = React.memo(React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> &
    ToastButtonProps & {
      position?: number
      isRemoving?: boolean
    }
>(({
  className, 
  variant, 
  acceptButton, 
  quitButton, 
  children, 
  position = 0, 
  isRemoving = false,
  ...props 
}, ref) => {
  const toastRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)

  React.useEffect(() => {
    const element = toastRef.current
    if (!element) return
    
    const updateHeight = () => {
      const newHeight = element.getBoundingClientRect().height
      if (newHeight > 0) {
        setHeight(newHeight)
      }
    }

    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)
    updateHeight()
    
    return () => observer.disconnect()
  }, [])

  const style = React.useMemo(() => {
    if (isRemoving) {
      return {
        transform: 'translate3d(0px, 0px, 0px) scale(1)',
        zIndex: 100 - position,
      } as React.CSSProperties
    }

    const baseOffset = height > 0 ? height + 16 : 88
    const y = Math.max(position * baseOffset, 0)
    const z = -position * 2

    return {
      transform: `translate3d(calc((1 - var(--hover, 0)) * 0px),
       calc((1 - var(--hover, 0)) * ${y}px),
       calc((1 - var(--hover, 0)) * ${z}px))`,
      zIndex: 100 - position,
    } as React.CSSProperties
  }, [position, height, isHovered, isRemoving])

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <div ref={toastRef} className="flex flex-col transform-gpu will-change-[transform,opacity]">
        {children}
        <ToastButtons acceptButton={acceptButton} quitButton={quitButton} />
      </div>
    </ToastPrimitives.Root>
  )  
}))
Toast.displayName = ToastPrimitives.Root.displayName

// 辅助组件
const ToastAction = React.memo(React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 items-center justify-center rounded-lg",
      "px-3 text-sm font-medium transition-colors",
      "hover:bg-gray-100 dark:hover:bg-gray-800",
      "focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-800",
      className
    )}
    {...props}
  />
)))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.memo(React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-4 top-4",
      "rounded-md p-1",
      "opacity-0 transition-opacity",
      "group-hover:opacity-100",
      "text-gray-900 dark:text-gray-100",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
)))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.memo(React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none tracking-tight",
      "text-inherit",
      className
    )}
    {...props}
  />
)))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.memo(React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(
        "mt-2 text-sm leading-normal",
        "text-inherit opacity-90",
        className
    )}
    {...props}
  />
)))
ToastDescription.displayName = ToastPrimitives.Description.displayName

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
