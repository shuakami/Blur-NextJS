import React, { memo, lazy, Suspense, useMemo, useRef, useEffect } from "react";
import { ThoughtProcess } from "@/types/stream";
import { Avatar } from "@/components/ui/avatar";
import MoonLogo from "../../../pages/logo";
import { useChatStateContext } from "@/app/[上下文]/ChatContext";
import MarkdownRenderer from "@/components/ui/markdown/MarkdownRenderer";
import { cn } from '@/lib/utils/utils';
import { Agent } from "./LLM/agent";
import AnimatedShinyText from "./animated-shiny-text";
import { UseToolSkeletons } from "./markdown/skeleton/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import AutoScrollToBottom from "./AutoScrollToBottom";

// 懒加载组件
const ThoughtStream = lazy(() =>
  import("./chat/ThoughtStream").then((mod) => ({
    default: mod.ThoughtStream || (() => null),
  }))
);

const MessageToolbar = lazy(() =>
  import("./message-toolbar").then((mod) => ({
    default: mod.MessageToolbar || (() => null),
  }))
);

const UseTool = lazy(() =>
  import("./chat/UseTool").then((mod) => ({ default: mod.default }))
);

const ErrorMessage = lazy(() =>
  import("./chat-list/ErrorMessage").then((mod) => ({ default: mod.default }))
);

const ErrorBoundary = lazy(() => 
  import('react-error-boundary').then(mod => ({
    default: mod.ErrorBoundary
  }))
);

const ErrorFallback = lazy(() => 
  import('@/components/ui/error-fallback').then(mod => ({
    default: mod.default
  }))
);

// 类型定义
interface BotMessageProps {
  content: string;
  messageId?: string;
  isLoading?: boolean;
  isLatestBotMessage: boolean;
  thought?: ThoughtProcess;
  error?: {
    code: number;
    message: string;
  };
}

// 工具类型
type ToolType = "code" | "text" | "tool";

interface ToolState {
  id: string;
  type: ToolType;
  content?: string;
  status: "input" | "calling" | "response";
  calling?: {
    content: string;
    plugin_id: string;
    plugin_name: string;
  };
  response?: {
    data: any;
    plugin_name: string;
  };
  params?: Record<string, any>;
}

interface GroupedTool {
  useTool: ToolState;
}

// 记忆工具类型
interface MemoryAction {
  type: "add" | "delete" | "query";
  content: string;
  raw: string;
  tags?: string[];
  select?: string;
  all?: boolean;
}

// 更新 ContentItem 类型
interface ContentItem {
  type: "text" | "group" | "other";
  content?: string;
  group?: GroupedTool;
}
// 正则表达式（提取内容）
const CONTENT_SPLIT_REGEX = /(\[USE_TOOL[^\]]*\]|\[\/USE_TOOL\]|<plugin-data>.*?<\/plugin-data>|<agent-data>.*?<\/agent-data>|<thinking>.*?<\/thinking>)/s;
const USE_TOOL_REGEX = /\[USE_TOOL[^\]]*?(?:id="([^"]+)"[^\]]*?type="([^"]+)"|type="([^"]+)"[^\]]*?id="([^"]+)")[^\]]*?\]/;

// 记忆工具正则
const MEMORY_ACTION_REGEX = /\[MEMORY(?:\s+(?:action="([^"]+)")?\s*(?:select="([^"]+)")?\s*(?:tags="([^"]+)")?)?\]([\s\S]*?)\[\/MEMORY\]/g;

// 错误处理工具函数
const handleError = (error: Error, context: string) => {
  if (process.env.NODE_ENV === 'development') {
    const errorMessage = `Error in ${context}: ${error.message}`;
    if (window.__DEV_ERROR_HANDLER__) {
      window.__DEV_ERROR_HANDLER__(errorMessage, error);
    }
  }
};

// 处理记忆操作
const useMemoryProcessor = (content: string) => {
  return useMemo(() => {
    const actions: MemoryAction[] = [];
    let processedContent = content;
    
    console.log('开始处理记忆命令:', content);
    
    processedContent = processedContent.replace(MEMORY_ACTION_REGEX, (match, action, select, tags, content) => {
      console.log('匹配到记忆命令:', {
        match,
        action,
        select,
        tags,
        content
      });
      
      const trimmedContent = content?.trim();
      
      // 处理select="*"或select="all"的情况
      const isSelectAll = select === '*' || select === 'all';
      
      if (trimmedContent || action === 'delete' || isSelectAll) {
        const memoryAction: MemoryAction = {
          type: (action as MemoryAction["type"]) || "add",
          content: trimmedContent || '',
          raw: match,
          select,
          tags: tags?.split(',').map((t: string) => t.trim()),
          all: isSelectAll
        };
        
        console.log('创建记忆动作:', memoryAction);
        actions.push(memoryAction);
      }
      
      return ""; // 移除原文本
    });
    
    console.log('处理完成, 记忆动作列表:', actions);

    return {
      processedContent,
      memoryActions: actions
    };
  }, [content]);
};

// 内容处理 Hook
const useContentProcessor = (content: string) => {
  // 缓存分割结果
  const parts = useMemo(() => {
    return content.split(CONTENT_SPLIT_REGEX);
  }, [content]);

  return useMemo(() => {
    const items: ContentItem[] = [];
    const toolQueue: ToolState[] = [];
    let isCollectingTool = false;

    const processPluginData = (part: string): ContentItem => {
      try {
        const pluginDataRaw = part.replace("<plugin-data>", "").replace("</plugin-data>", "").trim();
        const pluginDataParsed = JSON.parse(pluginDataRaw);
        const { status, content: pluginContent, plugin_id, plugin_name, plugin_response } = pluginDataParsed;
        
        const pluginData = {
          status,
          content: pluginContent,
          data: plugin_response?.data,
          plugin_id: String(plugin_id),
          plugin_name
        };

        if (toolQueue.length > 0) {
          const tool = toolQueue[0];
          if (pluginData.status === "calling") {
            tool.status = "calling";
            tool.calling = {
              content: pluginData.content || "",
              plugin_id: pluginData.plugin_id || "",
              plugin_name: pluginData.plugin_name || ""
            };
          } else if (pluginData.status === "response") {
            tool.status = "response";
            tool.response = {
              data: pluginData.data,
              plugin_name: pluginData.plugin_name || ""
            };
            toolQueue.shift();
          }
          return { type: "other" };
        }
        
        return { type: "text", content: part };
      } catch (e) {
        handleError(e as Error, 'Plugin data processing');
        return { type: "text", content: part };
      }
    };

    parts.forEach(part => {
      if (part.startsWith("[USE_TOOL") && !part.includes("[/USE_TOOL]")) {
        const match = part.match(USE_TOOL_REGEX);
        if (match) {
          const id = match[1] || match[4];
          const type = match[2] || match[3];
          
          console.log('[useContentProcessor] Found tool:', { id, type });
          
          const tool: ToolState = {
            id,
            type: type as ToolType,
            content: '',
            status: "input"
          };
          toolQueue.push(tool);
          items.push({
            type: "group",
            group: { useTool: tool }
          });
          isCollectingTool = true;
        }
      } else if (part === "[/USE_TOOL]") {
        isCollectingTool = false;
      } else if (isCollectingTool && toolQueue.length > 0) {
        const currentTool = toolQueue[toolQueue.length - 1];
        currentTool.content = (currentTool.content || '') + part;
      } else if (part.startsWith("<plugin-data>")) {
        items.push(processPluginData(part));
      } else if (part.startsWith("<agent-data>") || part.startsWith("<thinking>")) {
        items.push({
          type: "other",
          content: part
        });
      } else if (part.trim()) {
        items.push({
          type: "text",
          content: part
        });
      }
    });

    return items;
  }, [parts]);
};


// MessageContent 组件
const MessageContent = memo(({ 
  item, 
  index,
  isStreaming,
  isLatestBotMessage,
  messageId
}: {
  item: ContentItem;
  index: number;
  isStreaming: boolean;
  isLatestBotMessage: boolean;
  messageId?: string;
}) => {

  const processAgentData = (content: string) => {
    try {
      const agentInfo = JSON.parse(
        content.replace("<agent-data>", "").replace("</agent-data>", "")
      );
      return (
        <Suspense key={index} fallback={null}>
          <Agent data={agentInfo} />
        </Suspense>
      );
    } catch (e) {
      handleError(e as Error, 'Agent data processing');
      return null;
    }
  };

  const processThinkingData = (content: string) => {
    try {
      const thoughtContent = content
        .replace("<thinking>", "")
        .replace("</thinking>", "");
      return (
        <Suspense key={index} fallback={null}>
          <ThoughtStream
            duration={0}
            content={thoughtContent}
            isAnimating={isLatestBotMessage && isStreaming}
          />
        </Suspense>
      );
    } catch (e) {
      handleError(e as Error, 'Thinking data processing');
      return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key={index}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        style={{ overflow: 'hidden' }}
      >
        {item.type === "text" && (
          <MarkdownRenderer
            content={item.content || ""}
            isStreaming={isStreaming && isLatestBotMessage}
          />
        )}
        
        {item.type === "group" && item.group && (
          <Suspense>
            <ErrorBoundary
              FallbackComponent={(props) => (
                <ErrorFallback 
                  {...props}
                  title={`工具加载失败(ID: ${item.group?.useTool?.id || 'N/A'})`}
                  message={props.error?.message}
                  showStack={process.env.NODE_ENV === 'development'}
                  retryText="重新加载"
                />
              )}
              onReset={() => {
                window.location.reload();
              }}
            >
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <UseTool
                  id={item.group.useTool.id}
                  message_id={messageId || ''}
                  type={item.group.useTool.type}
                  content={item.group.useTool.content}
                  status={item.group.useTool.status}
                  isStreaming={isStreaming && isLatestBotMessage}
                  calling={item.group.useTool.calling}
                  response={item.group.useTool.response}
                />
              </motion.div>
            </ErrorBoundary>
          </Suspense>
        )}
        
        {item.type === "other" && item.content && (
          item.content.startsWith("<agent-data>") ? processAgentData(item.content) :
          item.content.startsWith("<thinking>") ? processThinkingData(item.content) :
          null
        )}
      </motion.div>
    </AnimatePresence>
  );
});

MessageContent.displayName = 'MessageContent';

// 主组件
const BotMessage = memo(({
  content,
  messageId,
  isLoading,
  isLatestBotMessage,
  thought,
  error,
}: BotMessageProps) => {
  const { isStreaming } = useChatStateContext();
  const messageRef = useRef<HTMLDivElement>(null);
  
  // 预处理记忆操作
  const { processedContent, memoryActions } = useMemoryProcessor(content);
  
  // 处理工具/插件等内容
  const contentItems = useContentProcessor(processedContent);

  useEffect(() => {
    if (isLatestBotMessage && messageRef.current) {
      // 等待动画完成后滚动
      setTimeout(() => {
        messageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }, 400);
    }
  }, [isLatestBotMessage, content]);

  return (
      <motion.div
        ref={messageRef}
        className="group relative flex w-full items-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
    >
      <div className="flex-shrink-0 pl-3 sm:pl-0">
        <Avatar className="h-9 w-9">
          <MoonLogo className="relative p-1.5" />
        </Avatar>
      </div>

      <motion.div
        className={cn(
          "flex flex-col min-w-0 flex-1 gap-1.5 ml-4 markdown",
          "group/message"
        )}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {thought && (
          <Suspense fallback={null}>
            <ThoughtStream
              duration={thought.duration || 0}
              content={thought.content || ""}
              isAnimating={thought.isAnimating || false}
            />
          </Suspense>
        )}

        <div className="markdown w-full break-words">
          {isLoading && isLatestBotMessage ? (
            <Suspense fallback={
              <motion.div
                className="animate-pulse h-4 bg-gray-200 rounded w-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
              />
            }>
              <AnimatedShinyText />
            </Suspense>
          ) : (
            <>
              {contentItems.map((item, index) => (
                <MessageContent
                  key={index}
                  item={item}
                  index={index}
                  isStreaming={isStreaming}
                  isLatestBotMessage={isLatestBotMessage}
                  messageId={messageId}
                />
              ))}
              {error && (
                <Suspense fallback={
                  <motion.div
                    className="animate-pulse h-4 bg-gray-200 rounded w-1/4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror" }}
                  />
                }>
                  <ErrorMessage error={error} />
                </Suspense>
              )}
            </>
          )}
        </div>

        <motion.div
          className={cn(
            "transition-opacity duration-200 -ml-1 flex items-center",
            isLatestBotMessage && isStreaming && "hidden"
          )}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={
            <motion.div
              className="animate-pulse h-4 bg-gray-200 rounded w-1/4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
            />
          }>
            <MessageToolbar
              content={processedContent}
              messageId={messageId}
              isLatestMessage={isLatestBotMessage}
              isStreaming={isStreaming}
              memoryActions={memoryActions}
              onRegenerate={() => {
                // 处理重新生成
              }}
            />
          </Suspense>
        </motion.div>
      </motion.div>
      </motion.div>
  );
})

BotMessage.displayName = "BotMessage";

// 类型声明
declare global {
  interface Window {
    __DEV_ERROR_HANDLER__?: (message: string, error: Error) => void;
  }
}

export default BotMessage;
