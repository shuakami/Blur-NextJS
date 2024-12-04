"use client"

import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { MessageSquarePlus, Search, Sparkles, Clock, Moon, Sun, Monitor } from "lucide-react"
import { cn } from '../../lib/utils/utils'
import type { Route } from 'next'
import { useRouter } from "next/navigation"

import useTranslation from '../../hooks/i18n/useTranslation'
import { useConversations } from "../../app/[对话管理]/ConversationsContext"
import { useUser } from "@clerk/nextjs"
import { useTheme } from "next-themes"

interface CommandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandDialog({ open, onOpenChange }: CommandDialogProps) {
  const { t } = useTranslation()
  const { isSignedIn } = useUser()
  const { recentConversations } = useConversations()
  const router = useRouter()
  const { setTheme } = useTheme()
  
  // 处理选择事件
  const handleSelect = React.useCallback((value: string) => {
    if (value.startsWith('chat/')) {
      const conversationId = value.replace('chat/', '')
      const path = `/chat/${conversationId}` as Route
      router.push(path)
      onOpenChange(false)
    }
  }, [router, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        overlayBgColor="bg-white/40 dark:bg-black/50"
        className={cn(
          "overflow-hidden p-0",
          "!translate-x-0 !translate-y-0",
          "!left-0 !right-0 !top-[20vh] !mx-auto",
          "!max-w-[640px]",
          "!rounded-xl !shadow-2xl outline-none",
          "border border-gray-150 dark:border-gray-800/70",
        )}
      >
        <Command className={cn(
          "[&_[cmdk-group-heading]]:px-2",
          "[&_[cmdk-group-heading]]:font-medium",
          "[&_[cmdk-group-heading]]:text-muted-foreground",
          "[&_[cmdk-group-heading]]:text-xs",
          "[&_[cmdk-group-heading]]:tracking-wider",
          "[&_[cmdk-group-heading]]:uppercase",
        )}>
          <CommandInput 
            showSearchIcon={false}
            placeholder={t("Type a command or search...")}
            className={cn(
              "h-14",
              "px-4",
              "border-none",
              "text-lg",
              "font-normal",
              "text-foreground",
              "placeholder:text-muted-foreground/70",
              "focus-visible:ring-0"
            )} 
          />
          <CommandList className="max-h-[400px] overflow-y-auto py-3">
            <CommandEmpty className="py-6 text-center text-sm">
              {t("未找到相关结果")}
            </CommandEmpty>
            
            <CommandGroup heading={t("快捷操作")} className="px-2">
              <CommandItem className="flex mt-1 items-center gap-3 px-4 py-3 rounded-lg aria-selected:bg-accent">
                <MessageSquarePlus className="w-4 h-4 text-muted-foreground/70" />
                <span className="flex-1 font-medium">新建对话</span>
                <kbd className="hidden md:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌥N
                </kbd>
              </CommandItem>
              
              <CommandItem className="flex items-center gap-3 px-4 py-3 rounded-lg aria-selected:bg-accent">
                <Sparkles className="w-4 h-4 text-muted-foreground/70" />
                <span className="flex-1 font-medium">快速对话</span>
              </CommandItem>

              <CommandItem className="flex items-center gap-3 px-4 py-3 rounded-lg aria-selected:bg-accent">
                <Search className="w-4 h-4 text-muted-foreground/70" />
                <span className="flex-1 font-medium">搜索对话历史</span>
                <kbd className="hidden md:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </CommandItem>
            </CommandGroup>

            {isSignedIn && (
              <CommandGroup heading={t("最近对话")} className="px-2 mt-2">
                {recentConversations.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {recentConversations.map(conversation => (
                      <CommandItem 
                        key={conversation.conversation_id}
                        value={`chat/${conversation.conversation_id}`}
                        onSelect={handleSelect}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg",
                          "aria-selected:bg-accent",
                          "data-[selected=true]:bg-accent",
                          "transition-colors",
                          "hover:bg-accent/50",
                          "cursor-pointer"
                        )}
                      >
                        <Clock className="w-4 h-4 text-muted-foreground/70" />
                        <span className="flex-1 font-medium">
                          {conversation.chat_title || t('未命名对话')}
                        </span>
                        <span className="text-xs text-muted-foreground/50">
                          {formatTime(conversation.timestamp)}
                        </span>
                      </CommandItem>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-muted-foreground/50">
                    {t("暂无对话记录")}
                  </div>
                )}
              </CommandGroup>
            )}

            <CommandGroup heading={t("主题设置")} className="px-2">
              <CommandItem 
                onSelect={() => { setTheme("light"); onOpenChange(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg aria-selected:bg-accent"
              >
                <Sun className="w-4 h-4 text-muted-foreground/70" />
                <span className="flex-1 font-medium">浅色模式</span>
              </CommandItem>
              
              <CommandItem 
                onSelect={() => { setTheme("dark"); onOpenChange(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg aria-selected:bg-accent"
              >
                <Moon className="w-4 h-4 text-muted-foreground/70" />
                <span className="flex-1 font-medium">深色模式</span>
              </CommandItem>

              <CommandItem 
                onSelect={() => { setTheme("system"); onOpenChange(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg aria-selected:bg-accent"
              >
                <Monitor className="w-4 h-4 text-muted-foreground/70" />
                <span className="flex-1 font-medium">跟随系统</span>
              </CommandItem>
            </CommandGroup>

            <div className="px-2 mt-4">
              <div className="px-4 py-3 text-xs text-muted-foreground/50 flex items-center justify-center gap-4">
                <span className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded border bg-muted/50 font-mono text-[10px]">↑ / ↓</kbd>
                  <span>导航</span>
                </span>
                <span className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded border bg-muted/50 font-mono text-[10px]">Enter</kbd>
                  <span>选择</span>
                </span>
              </div>
            </div>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function formatTime(timestamp: number): string {
  const now = Date.now()
  const date = new Date(timestamp * 1000)
  const diff = now - date.getTime()
  
  if (diff < 3600000) { // 1小时内
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  } else if (diff < 86400000) { // 24小时内
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  } else if (diff < 604800000) { // 7天内
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}