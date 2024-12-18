"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from '../../lib/utils/utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

/** 
 * 对话框组件，作为对话框的根组件。
 * 用于管理对话框的打开和关闭状态。
 */
const Dialog = DialogPrimitive.Root

/** 
 * 对话框触发器组件，用户点击此组件时会打开对话框。
 * 通常用于按钮或链接。
 */
const DialogTrigger = DialogPrimitive.Trigger

/** 
 * 对话框门户组件，负责将对话框内容渲染到正确的 DOM 节点中。
 * 这有助于确保对话框在视觉上覆盖其他内容。
 */
const DialogPortal = DialogPrimitive.Portal

/** 
 * 对话框关闭组件，用户点击此组件时会关闭对话框。
 * 通常用于关闭按钮或图标。
 */
const DialogClose = DialogPrimitive.Close


interface DialogOverlayProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {
    overlayBgColor?: string;
}

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    DialogOverlayProps  // 使用新的Props类型
>(({ className, overlayBgColor, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50",
            // 如果提供了overlayBgColor就使用它,否则使用默认值
            overlayBgColor || "bg-black/30 dark:bg-black/40",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    overlayBgColor?: string;
    showClose?: boolean;
}

/** 
 * 对话框内容组件，包含对话框的主要内容和关闭按钮。
 */
const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    DialogContentProps
>(({ className, children, overlayBgColor, showClose = true, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay overlayBgColor={overlayBgColor} />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed z-50",
                "left-0 right-0 bottom-0",
                "w-full mx-auto",
                "sm:left-[50%] sm:right-auto sm:bottom-auto sm:top-[50%]",
                "p-6",
                "rounded-t-[20px]",
                "sm:rounded-[12px]",
                "bg-white dark:bg-gray-900",
                "border-t border-gray-100 dark:border-gray-800",
                "sm:border",
                "shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.12)]",
                "dark:shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.36)]",
                "sm:shadow-[0_6px_32px_-12px_rgba(0,0,0,0.22)]",
                "duration-200",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
                "sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95",
                "sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=open]:slide-in-from-left-1/2",
                "sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-top-[48%]",
                "sm:translate-x-[-50%] sm:translate-y-[-50%]",
                className
            )}
            {...props}
        >
            <VisuallyHidden asChild>
                <DialogPrimitive.Title>对话框</DialogPrimitive.Title>
            </VisuallyHidden>
            {children}
            {showClose && (
                <DialogPrimitive.Close 
                    className={cn(
                        "absolute right-5 top-5 hidden md:block",
                        "p-2 rounded-full",
                        "touch-manipulation",
                        "text-gray-500 dark:text-gray-400",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        "transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600",
                        "sm:p-1.5 sm:rounded-lg"
                    )}
                >
                    <X className="h-5 w-5 sm:h-4 sm:w-4" />
                    <span className="sr-only">关闭</span>
                </DialogPrimitive.Close>
            )}
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
            "flex flex-col-reverse gap-3",
            "mt-6",
            "sm:flex-row sm:justify-end sm:space-x-2 sm:mt-4",
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