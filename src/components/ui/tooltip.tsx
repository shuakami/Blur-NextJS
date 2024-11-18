"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

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
        "bg-white dark:bg-black/[0.98]",
        "border border-gray-200/80 dark:border-white/[0.15]",
        "px-3 py-2",
        "text-xs leading-4",
        "text-gray-900 dark:text-white",
        "shadow-[0_2px_8px_rgba(0,0,0,0.12)]",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-100",
        "relative",
        "forced-colors:outline",
        "[&_*]:dir-rtl:text-right",
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
        width={10}
        height={5}
        className={cn(
          "absolute",
          "left-1/2 -translate-x-1/2",
          "fill-white dark:fill-black/[0.98]",
          "stroke-gray-200/80 dark:stroke-white/[0.15]",
        )}
      />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }