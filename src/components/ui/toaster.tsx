// src/components/ui/Toaster.tsx

"use client"

import { Toaster } from 'sonner'
import { cn } from "@/lib/utils/utils"

export function ToasterComponent() {
  return (
    <Toaster 
      position="bottom-right"
      icons={{
        success: null,
        error: null,
        warning: null,
        info: null,
        loading: null,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            "group p-5 rounded-xl min-w-[370px]",
            "shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
            "dark:shadow-[0_8px_24px_rgba(0,0,0,0.25)]",
            "bg-white text-gray-900 dark:bg-black dark:text-gray-100",
            "border border-gray-100 dark:border-gray-900",
            "[&>div[data-icon]]:hidden [&>div[data-icon]]:!w-0 [&>div[data-icon]]:!h-0 [&>div[data-icon]]:!m-0",
            "[&>button]:float-right [&>button:not(:first-of-type)]:mr-2"
          ),
          title: "text-sm font-medium leading-none tracking-tight",
          description: "mt-2 text-sm leading-normal opacity-90",
          actionButton: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium px-3 h-8 rounded-lg",
          cancelButton: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium px-3 h-8 rounded-lg",
          error: cn(
            "!bg-rose-600 !text-white !font-semibold",
            "!border-rose-600"
          ),
          success: cn(
            "!bg-green-500 !text-white !font-semibold",
            "!border-green-500"
          ),
          info: cn(
            "!bg-blue-500 !text-white !font-semibold",
            "!border-blue-500"
          ),
          warning: cn(
            "!bg-yellow-400 !text-gray-900 !font-semibold",
            "!border-yellow-400"
          ),
        }
      }}
    />
  )
}

// 为了保持向后兼容性
export { ToasterComponent as Toaster }
