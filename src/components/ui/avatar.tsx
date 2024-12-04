"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from '../../lib/utils/utils'

// 定义尺寸和状态类型
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'
type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

// 尺寸样式映射
const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16"
}

// 状态样式映射
const statusStyles: Record<AvatarStatus, string> = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  busy: "bg-red-500",
  away: "bg-yellow-500"
}

// 扩展 Avatar 组件的 props
interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: AvatarSize
  status?: AvatarStatus
  statusPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ 
  className, 
  size = 'md', 
  status,
  statusPosition = 'bottom-right',
  ...props 
}, ref) => (
  <div className="relative inline-block">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-black/10 dark:border-white/15",
        sizeStyles[size],
        className
      )}
      {...props}
    />
    {status && (
      <span 
        className={cn(
          "absolute block rounded-full border-2 border-white dark:border-gray-900",
          statusStyles[status],
          {
            'h-2.5 w-2.5': size === 'sm',
            'h-3 w-3': size === 'md',
            'h-3.5 w-3.5': size === 'lg',
            'h-4 w-4': size === 'xl',
          },
          {
            'top-0 right-0': statusPosition === 'top-right',
            'top-0 left-0': statusPosition === 'top-left',
            'bottom-0 right-0': statusPosition === 'bottom-right',
            'bottom-0 left-0': statusPosition === 'bottom-left',
          }
        )}
      />
    )}
  </div>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

// 扩展 AvatarImage 组件的 props
interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ 
  className, 
  onLoadingStatusChange,
  ...props 
}, ref) => {
  React.useEffect(() => {
    onLoadingStatusChange?.('idle')
  }, [onLoadingStatusChange])

  const handleLoad = () => onLoadingStatusChange?.('loaded')
  const handleError = () => onLoadingStatusChange?.('error')

  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full rounded-full", className)}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
export type { AvatarProps, AvatarImageProps }
