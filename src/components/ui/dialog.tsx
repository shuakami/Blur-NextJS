"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50",
            "bg-black/30 dark:bg-black/40",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed z-50",
                "sm:left-[50%] sm:top-[50%]",
                "left-0 bottom-0 sm:bottom-auto",
                "w-full sm:max-w-lg",
                "sm:translate-x-[-50%] sm:translate-y-[-50%]",
                "bg-white dark:bg-gray-900",
                "rounded-t-xl sm:rounded-xl",
                "py-[23px] px-7",
                "border border-gray-200 dark:border-gray-800",
                "shadow-[0_6px_32px_-12px_rgba(0,0,0,0.22)] dark:shadow-[0_6px_32px_-12px_rgba(0,0,0,0.50)]",
                "duration-200",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95",
                "data-[state=closed]:slide-out-to-bottom sm:data-[state=closed]:slide-out-to-left-1/2",
                "data-[state=closed]:slide-out-to-bottom sm:data-[state=closed]:slide-out-to-top-[48%]",
                "data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-left-1/2",
                "data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-top-[48%]",
                "md:w-full",
                className
            )}
            {...props}
        >
            {children}
            <DialogPrimitive.Close 
                className={cn(
                    "absolute right-5 top-5",
                    "p-1.5 rounded-lg",
                    "sm:p-1.5 touch-manipulation",
                    "text-gray-500 dark:text-gray-400",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    "transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                )}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">关闭</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2.5",
            "text-center sm:text-left",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse gap-3 sm:gap-0",
            "mt-4 sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(
            "text-lg font-semibold",
            "text-gray-900 dark:text-gray-100",
            "leading-normal",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn(
            "text-base",
            "text-gray-500 dark:text-gray-400",
            "leading-relaxed",
            className
        )}
        {...props}
    />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogBody = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "px-7 pb-6",
            className
        )}
        {...props}
    />
)
DialogBody.displayName = "DialogBody"

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogBody,
}