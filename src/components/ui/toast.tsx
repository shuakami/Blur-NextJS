"use client"

import * as React from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
            "fixed top-4 right-4 z-[100] flex max-h-screen flex-col-reverse gap-2",
            className
        )}
        {...props}
    />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
    "group pointer-events-auto relative ml-auto flex items-center justify-center overflow-hidden rounded-3xl border px-4 py-3 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full backdrop-blur-sm",
    {
        variants: {
            variant: {
                default:
                    "border-gray-200 bg-white/90 text-gray-900 dark:border-gray-800 dark:bg-gray-900/90 dark:text-gray-100 shadow-lg shadow-gray-500/10 dark:shadow-gray-900/20",
                destructive:
                    "border-red-200 bg-red-50/90 text-red-600 dark:border-red-800 dark:bg-red-900/90 dark:text-red-300 shadow-lg shadow-red-500/10",
                info:
                    "border-blue-200 bg-blue-50/90 text-blue-600 dark:border-blue-800 dark:bg-blue-900/90 dark:text-blue-300 shadow-lg shadow-blue-500/10",
                success:
                    "border-green-200 bg-green-50/90 text-green-600 dark:border-green-800 dark:bg-green-900/90 dark:text-green-300 shadow-lg shadow-green-500/10",
                warning:
                    "border-yellow-200 bg-yellow-50/90 text-yellow-600 dark:border-yellow-800 dark:bg-yellow-900/90 dark:text-yellow-300 shadow-lg shadow-yellow-500/10",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, children, ...props }, ref) => {
    return (
        <ToastPrimitives.Root
            ref={ref}
            className={cn(toastVariants({ variant }), className)}
            {...props}
        >
            <div className="flex items-center gap-3 w-fit max-w-[480px] pr-2">
                {children}
            </div>
            <ToastClose />
        </ToastPrimitives.Root>
    )
})

Toast.displayName = ToastPrimitives.Root.displayName


const ToastAction = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Action>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className={cn(
            "inline-flex h-6 shrink-0 items-center justify-center rounded-full border bg-transparent px-2 text-xs font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
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
            "absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 opacity-0 transition-all hover:bg-zinc-500/10 dark:hover:bg-zinc-100/10 focus:opacity-100 focus:outline-none group-hover:opacity-70 hover:opacity-100",
            className
        )}
        toast-close=""
        {...props}
    >
        <Cross2Icon className="h-3 w-3" />
        <span className="sr-only">关闭</span>
    </ToastPrimitives.Close>
))

ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Title>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Title
        ref={ref}
        className={cn("text-sm font-medium leading-none tracking-tight", className)}
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
        className={cn(
            "text-sm opacity-90 pl-3 border-l border-zinc-200/30 dark:border-zinc-700/30",
            className
        )}
        {...props}
    />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
    type ToastProps,
    type ToastActionElement,
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction,
}