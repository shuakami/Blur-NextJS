"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from '../../lib/utils/utils'
import { useMediaQuery } from '../../hooks/ui/use-media-query'
import { XIcon } from 'lucide-react'

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    mobileHeader?: {
      title: string;
    };
  }
>(({ className, align = "center", sideOffset = 4, mobileHeader, ...props }, ref) => {
  const isMobile = useMediaQuery('(max-width: 640px)')

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          // 基础样式
          "z-50 origin-top-right",
          "bg-white dark:bg-gray-900",
          "focus:outline-none",
          
          // 移动端样式
          isMobile ? cn(
            "fixed inset-x-0 bottom-0",
            "w-full",
            "rounded-t-2xl",
            "border-t border-gray-200 dark:border-gray-800",
            "max-h-[70vh]",
            "overflow-hidden"
          ) : cn(
            // 桌面端样式
            "rounded-xl",
            "border border-gray-200 dark:border-gray-800",
            "py-1 px-1.5",
            "shadow-[0_5px_30px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_5px_30px_-12px_rgba(0,0,0,0.45)]",
          ),

          // 动画
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          isMobile ? cn(
            "data-[state=closed]:slide-out-to-bottom",
            "data-[state=open]:slide-in-from-bottom",
          ) : cn(
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2",
          ),
          
          className
        )}
        {...props}
      >
        {isMobile && mobileHeader && (
          <div className="sticky top-0 -mt-2 -mx-2 z-10 flex items-center justify-between px-4 py-3
                         border-b border-gray-200/80 dark:border-gray-800/80
                         bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
                         supports-[backdrop-filter]:bg-white/80 
                         supports-[backdrop-filter]:dark:bg-gray-900/80">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mx-2">
              {mobileHeader.title}
            </h3>
            <PopoverPrimitive.Close className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                                             transition-colors">
              <XIcon className="w-4 h-4 text-gray-500" />
            </PopoverPrimitive.Close>
          </div>
        )}
        <div className={cn(
          isMobile && "px-2 py-2",
          "space-y-0.5"
        )}>
          {props.children}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
})

PopoverContent.displayName = PopoverPrimitive.Content.displayName

// 内容组件
const PopoverHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2.5 py-1.5",
      className
    )}
    {...props}
  />
))
PopoverHeader.displayName = "PopoverHeader"

const PopoverBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2.5 py-1.5",
      className
    )}
    {...props}
  />
))
PopoverBody.displayName = "PopoverBody"

const PopoverFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2.5 py-1.5",
      className
    )}
    {...props}
  />
))
PopoverFooter.displayName = "PopoverFooter"

const PopoverDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "my-1 h-px bg-gray-200/50 dark:bg-gray-700/50",
      className
    )}
    {...props}
  />
))
PopoverDivider.displayName = "PopoverDivider"

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverDivider
}