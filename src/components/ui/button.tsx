import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "relative overflow-hidden bg-primary/90 text-primary-foreground shadow-sm hover:bg-primary/95 hover:shadow active:shadow-inner active:translate-y-[1px] transition-all",

        destructive:
          "relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/0 after:via-white/10 after:to-white/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity",

        outline:
          "border border-input bg-background hover:bg-accent/5 hover:border-accent/30 dark:hover:bg-accent/10 dark:hover:border-accent/40 transition-colors",

        secondary:
          "relative overflow-hidden bg-gradient-to-r from-zinc-100 to-zinc-200 text-zinc-900 shadow-lg shadow-zinc-200/30 hover:shadow-xl hover:shadow-zinc-300/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/0 after:via-white/20 after:to-white/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-100 dark:shadow-zinc-900/30 dark:after:via-white/5",

        ghost: "hover:bg-accent hover:text-accent-foreground",

        link: "text-primary underline-offset-4 hover:underline decoration-primary/30 hover:decoration-primary/60",

        gradient: 
          "relative overflow-hidden bg-gradient-to-r from-[#4ECDC4] to-[#45B7D1] text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0 hover:bg-[length:200%_200%] hover:animate-gradient hover:bg-gradient-to-r hover:from-[#4ECDC4] hover:via-[#2D9CDB] hover:to-[#4ECDC4] before:absolute before:inset-0 before:bg-gradient-to-r before:from-black/0 before:via-black/5 before:to-black/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/0 after:via-white/10 after:to-white/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity duration-300",

        glass: 
          "relative backdrop-blur-md bg-black/10 border border-black/20 text-gray-800 shadow-lg hover:bg-black/20 hover:border-black/30 transition-all duration-300 dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/20 dark:hover:border-white/30 dark:shadow-none dark:hover:text-white/90",

        wheat: 
          "relative overflow-hidden bg-gradient-to-r from-[#F5D0A3] to-[#F2994A] text-white font-medium shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 hover:bg-[length:200%_200%] hover:animate-gradient hover:bg-gradient-to-r hover:from-[#F2C94C] hover:via-[#F2994A] hover:to-[#F2C94C] before:absolute before:inset-0 before:bg-gradient-to-r before:from-black/0 before:via-black/5 before:to-black/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/0 after:via-white/10 after:to-white/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity duration-300",

        neon: 
          "relative bg-zinc-900 text-emerald-400 border border-emerald-500/50 hover:border-emerald-500/80 hover:text-emerald-300 hover:bg-emerald-950/30 dark:bg-zinc-950 transition-all duration-300 before:absolute before:inset-0 before:rounded-[7px] before:p-[1px] before:bg-gradient-to-r before:from-emerald-500/0 before:via-emerald-500/40 before:to-emerald-500/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity",

        soft: 
          "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-colors duration-300",

        retro: 
          "relative bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-[3px_3px_0px_rgb(200,200,200)] hover:shadow-[2px_2px_0px_rgb(200,200,200)] active:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] transition-all duration-150 after:absolute after:inset-0 after:bg-gradient-to-b after:from-black/5 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity hover:bg-gradient-to-b hover:from-gray-50 hover:to-gray-100 dark:from-neutral-900 dark:to-neutral-800 dark:text-neutral-200 dark:border-neutral-700 dark:shadow-[3px_3px_0px_rgb(0,0,0)] dark:hover:shadow-[2px_2px_0px_rgb(0,0,0)] dark:hover:from-neutral-800 dark:hover:to-neutral-700",

        gooey: 
          "relative overflow-hidden bg-violet-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 dark:bg-violet-600 dark:shadow-violet-600/20 dark:hover:shadow-violet-600/40 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)] after:absolute after:inset-0 after:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] after:bg-[length:200%_100%] hover:after:translate-x-[100%] after:transition-[transform] after:duration-\[400ms\] after:ease-linear",

        shine: 
          "relative overflow-hidden bg-white text-gray-800 border border-gray-200/60 before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-[150%] before:bg-gradient-to-r before:from-transparent before:via-black/5 before:to-transparent before:transition-transform before:duration-700 shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all dark:bg-gray-950 dark:text-gray-200 dark:before:via-white/10 dark:border-gray-800/60 dark:hover:border-gray-700/80",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-11 rounded-lg px-8 text-base font-semibold tracking-wide",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  tooltip?: string | React.ReactNode
  /**
   * 按钮外观风格
   * @remarks
   * 🎨 视觉风格速览:
   * 
   * ⚡️ default     = 经典实心按钮 [深色底色]
   * 
   * ❌ destructive = 警告红按钮 [红色渐变]
   * 
   * ⚪️ outline     = 线框按钮 [透明底色+边框]
   * 
   * 🔘 secondary   = 次要按钮 [灰色渐变]
   * 
   * 👻 ghost       = 隐形按钮 [仅悬浮显示]
   * 
   * 🔗 link        = 链接按钮 [下划线]
   * 
   * 🌊 gradient    = 清新渐变 [青色水波纹]
   * 
   * ✨ glass       = 磨砂玻璃 [半透明模糊]
   * 
   * 🍯 wheat       = 温暖渐变 [蜂蜜色系]
   * 
   * 💫 neon        = 赛博朋克 [霓虹发光边框]
   * 
   * 🫧 soft        = 轻柔按钮 [柔和色调]
   * 
   * 🕹️ retro       = 复古按钮 [像素风立体感]
   * 
   * 🌈 gooey       = 果冻按钮 [紫色流体效果]
   * 
   * ⭐️ shine       = 闪光按钮 [扫光动画]
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 
           'link' | 'gradient' | 'glass' | 'wheat' | 'neon' | 'soft' | 
           'retro' | 'gooey' | 'shine'
  /**
   * 按钮尺寸
   * @default "default"
   * 
   * - default: 标准尺寸 (h-10)
   * - sm: 小型按钮 (h-9)
   * - lg: 大型按钮 (h-11)
   * - icon: 图标按钮 (h-10 w-10)
   */
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, tooltip, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonElement}
          </TooltipTrigger>
          <TooltipContent>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )
    }

    return buttonElement
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
