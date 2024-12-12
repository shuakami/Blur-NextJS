"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from '../../lib/utils/utils'

const TooltipProvider = ({
  children,
  delayDuration = 200,
  skipDelayDuration = 300,
  ...props
}: TooltipPrimitive.TooltipProviderProps & {
  delayDuration?: number
  skipDelayDuration?: number
}) => {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    >
      {children}
    </TooltipPrimitive.Provider>
  )
}

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Trigger
    ref={ref}
    className={cn(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600",
      className
    )}
    {...props}
  />
))
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    maxWidth?: number | string
  }
>(({ className, sideOffset = 8, maxWidth = 320, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={16}
      avoidCollisions={true}
      className={cn(
        "z-50 overflow-visible rounded-md",
        "bg-gray-950 dark:bg-white",
        "px-4 py-2.5",
        "text-sm leading-5",
        "text-white dark:text-gray-950",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-100",
        "relative",
        "forced-colors:outline",
        "[&_*]:dir-rtl:text-right",
        "hidden md:block", // 隐藏移动端显示
        className
      )}
      style={{
        maxWidth: maxWidth,
        wordWrap: "break-word",
      }}
      role="tooltip"
      aria-live="polite"
      {...props}
    >
      <div className="max-h-[var(--radix-tooltip-content-available-height)] overflow-auto">
        {props.children}
      </div>
      <TooltipPrimitive.Arrow
        width={12}
        height={6}
        className={cn(
          "absolute",
          "left-1/2 -translate-x-1/2",
          "fill-gray-900 dark:fill-white",
        )}
      />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }