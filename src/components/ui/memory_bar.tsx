import React, { useState, useCallback, useMemo } from 'react';
import { Brain, ChevronDown, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverDivider,
  PopoverFooter
} from './popover';
import { Button } from './button';
import dynamic from 'next/dynamic';
import { Spinner } from './spinner';

const MemoryManagerDialog = dynamic(() => import('./memory/memory-manager-dialog').then(mod => mod.MemoryManagerDialog), {
    loading: () => <Spinner />,
    ssr: false
  });

interface MemoryAction {
  type: 'add' | 'delete' | 'query';
  content: string;
  tags?: string[];
  select?: string;
  all?: boolean;
}

interface MemoryBarProps {
  actions?: MemoryAction[];
}

// 清理 markdown
const cleanMarkdown = (text: string) => {
    return text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
};

export function MemoryBar({ actions = [] }: MemoryBarProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [open, setOpen] = useState(false);

  const handleExpandToggle = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  const actionCounts = useMemo(() => 
    actions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  , [actions]);

  const formatContent = useCallback((action: MemoryAction, isExpanded: boolean, index: number) => {
    const cleanedContent = cleanMarkdown(action.content);
    const lines = cleanedContent.split('\n').filter(line => line.trim());
    const shouldShowExpand = cleanedContent.length > 100 || lines.length > 1;
    const displayContent = isExpanded ? cleanedContent : cleanedContent.slice(0, 100);

    const hasTags = action.tags && action.tags.length > 0;
    const hasSelect = action.select && action.select !== '*';
    const showTags = (hasTags || hasSelect);

    return (
      <div className="space-y-1">
        <div className="flex flex-col gap-1">
          {/* 标签区域 */}
          {showTags && (
            <div className="flex gap-1 flex-wrap">
              {hasTags && action.tags?.map((tag, i) => (
                <span key={i} 
                  className="inline-flex items-center px-1 h-4 text-[10px] rounded-md
                           bg-neutral-50 dark:bg-neutral-800/50
                           text-neutral-500 dark:text-neutral-400
                           border border-neutral-100 dark:border-neutral-700/50">
                  {tag}
                </span>
              ))}
              {hasSelect && (
                <span className="inline-flex items-center px-1 h-4 text-[10px] rounded-md
                             bg-neutral-50 dark:bg-neutral-800/50
                             text-neutral-500 dark:text-neutral-400
                             border border-neutral-100 dark:border-neutral-700/50">
                  {action.select}
                </span>
              )}
            </div>
          )}

          {/* 内容区域 */}
          <div className={cn(
            "text-xs text-neutral-600 dark:text-neutral-400 break-all",
            !isExpanded && shouldShowExpand && "line-clamp-2"
          )}>
            {displayContent}
            {!isExpanded && shouldShowExpand && "..."}
          </div>
        </div>

        {/* 展开/收起按钮 */}
        {shouldShowExpand && (
          <button
            type="button"
            onClick={(e) => handleExpandToggle(index, e)}
            className="text-[10px] text-neutral-500 hover:text-neutral-700 
                     dark:text-neutral-400 dark:hover:text-neutral-200
                     flex items-center gap-0.5 mt-0.5 focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-neutral-400
                     dark:focus-visible:ring-neutral-600 rounded"
          >
            <ChevronDown 
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                isExpanded && "transform rotate-180"
              )}
            />
            {isExpanded ? "收起" : "展开"}
          </button>
        )}
      </div>
    );
  }, [handleExpandToggle]);

  // 渲染 action 项
  const renderActionItem = useCallback((action: MemoryAction, index: number) => {
    const isExpanded = !!expandedItems[index];
    return (
      <div
        key={index}
        className={getActionStyle(action.type, action.all)}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium flex items-center gap-1.5">
            {getActionLabel(action.type, action.select === '*')}
          </span>
        </div>
        {formatContent(action, isExpanded, index)}
      </div>
    );
  }, [expandedItems, formatContent]);

  // 如没有 actions返回 null
  if (!actions || actions.length === 0) return null;

  const getSummaryText = () => {
    const parts = [];
    if (actionCounts.add) parts.push(`添加了${actionCounts.add}条记忆`);
    if (actionCounts.delete) {
      // 检查是否存在全局删除
      const hasGlobalDelete = actions.some(a => a.type === 'delete' && a.select === '*');
      parts.push(hasGlobalDelete ? '清空了所有记忆' : `删除了${actionCounts.delete}条记忆`);
    }
    if (actionCounts.query) parts.push(`查询了${actionCounts.query}条记忆`);
    return parts.join('、');
  };

  const getActionLabel = (type: MemoryAction['type'], isAll?: boolean) => {
    switch (type) {
      case 'add':
        return '添加记忆';
      case 'delete':
        return isAll ? '清空了所有记忆' : '删除记忆';
      case 'query':
        return '查询记忆';
    }
  };

  const getActionStyle = (type: MemoryAction['type'], isAll?: boolean) => {
    const baseStyle = cn(
      "flex flex-col gap-1 px-2.5 py-2 rounded-md transition-colors duration-150",
      isAll && "bg-neutral-50/80 dark:bg-neutral-800/50"
    );
    
    switch (type) {
      case 'add':
        return cn(baseStyle, 
          "hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
          "text-emerald-600 dark:text-emerald-400"
        );
      case 'delete':
        return cn(baseStyle, 
          "hover:bg-rose-50 dark:hover:bg-rose-950/30",
          "text-rose-600 dark:text-rose-400"
        );
      case 'query':
        return cn(baseStyle, 
          "hover:bg-sky-50 dark:hover:bg-sky-950/30",
          "text-sky-600 dark:text-sky-400"
        );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="md"
          className={cn(
            "h-auto gap-2 px-2 py-1.5 text-xs",
            "text-neutral-600 dark:text-neutral-400",
            "hover:bg-neutral-100 dark:hover:bg-neutral-800",
            "focus:bg-neutral-100 dark:focus:bg-neutral-800",
            "focus:outline-none focus-visible:ring-2",
            "focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
          )}
        >
          <Brain className="h-3.5 w-3.5" />
          <span className="tabular-nums">{getSummaryText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto max-w-sm md:max-w-xl"
        align="center"
        side="top"
        sideOffset={4}
        collisionPadding={16}
        avoidCollisions={true}
      >
        <PopoverBody className="p-1">
          <div className="space-y-1 max-h-64 overflow-y-auto overflow-x-hidden scrollbar-thin 
                        scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800
                        scrollbar-track-transparent">
            {actions.map((action, index) => renderActionItem(action, index))}
          </div>
        </PopoverBody>
        <PopoverDivider />
        <PopoverFooter className="p-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
              "text-xs font-medium text-neutral-600 dark:text-neutral-400",
              "hover:bg-neutral-100 dark:hover:bg-neutral-800",
              "focus:outline-none focus-visible:ring-2",
              "focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600",
              "transition-colors duration-150"
            )}
          >
            <Settings2 className="h-3.5 w-3.5" />
            管理记忆
          </button>
        </PopoverFooter>
      </PopoverContent>
      <MemoryManagerDialog 
        open={open} 
        onOpenChange={setOpen} 
      />
    </Popover>
  );
}