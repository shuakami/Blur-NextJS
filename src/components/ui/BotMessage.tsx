import React, { memo, lazy, Suspense, useMemo } from "react";
import { ThoughtProcess } from "@/types/stream";
import { Avatar } from "@/components/ui/avatar";
import MoonLogo from "../../../pages/logo";
import { useChatStateContext } from "@/app/[上下文]/ChatContext";
import MarkdownRenderer from "@/components/ui/markdown/MarkdownRenderer";
import { cn } from '../../lib/utils/utils';
import { Agent } from "./LLM/agent";
import AnimatedShinyText from "./animated-shiny-text";
import { UseToolSkeletons } from "./markdown/skeleton/skeleton";

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

interface ToolState {
  id: string;
  type: "code" | "text";
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
}

interface GroupedTool {
  useTool: ToolState;
}

interface ContentItem {
  type: "text" | "group" | "other";
  content?: string;
  group?: GroupedTool;
}

// 正则表达式（提取内容）
const CONTENT_SPLIT_REGEX = /(\[USE_TOOL[^\]]*\]|\[USE_TOOL\/\]|<plugin-data>.*?<\/plugin-data>|<agent-data>.*?<\/agent-data>|<thinking>.*?<\/thinking>)/s;
const USE_TOOL_REGEX = /\[USE_TOOL type="(code|text)" id="([^"]+)"\]/;

// 错误处理工具函数
const handleError = (error: Error, context: string) => {
  if (process.env.NODE_ENV === 'development') {
    const errorMessage = `Error in ${context}: ${error.message}`;
    if (window.__DEV_ERROR_HANDLER__) {
      window.__DEV_ERROR_HANDLER__(errorMessage, error);
    }
  }
};

// 内容处理 Hook
const useContentProcessor = (content: string) => {
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
        
        return {
          type: "text",
          content: part
        };
      } catch (e) {
        handleError(e as Error, 'Plugin data processing');
        return {
          type: "text",
          content: part
        };
      }
    };

    parts.forEach(part => {
      if (part.startsWith("[USE_TOOL") && !part.includes("[USE_TOOL/]")) {
        const match = part.match(USE_TOOL_REGEX);
        if (match) {
          const [, type, id] = match;
          const tool: ToolState = {
            id,
            type: type as "code" | "text",
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
      } else if (part === "[USE_TOOL/]") {
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

// 工具骨架屏选择函数
const getToolSkeleton = (tool: ToolState) => {
  if (tool.id === '8') return UseToolSkeletons.weather;
  if (tool.status === 'calling') return UseToolSkeletons.calling;
  return UseToolSkeletons.collapsed;
};

// MessageContent 组件
const MessageContent = memo(({ 
  item, 
  index,
  isStreaming,
  isLatestBotMessage 
}: {
  item: ContentItem;
  index: number;
  isStreaming: boolean;
  isLatestBotMessage: boolean;
}) => {

  const toolFallback = useMemo(() => {
    if (item.type === "group" && item.group) {
      const Skeleton = getToolSkeleton(item.group.useTool);
      return <Skeleton />;
    }
    return null;
  }, [item]);

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

  if (item.type === "text") {
    return (
      <MarkdownRenderer
        key={index}
        content={item.content || ""}
        isStreaming={isStreaming && isLatestBotMessage}
      />
    );
  }
  
  if (item.type === "group" && item.group) {
    const tool = item.group.useTool;
    
    return (
      <Suspense key={index} fallback={toolFallback}>
        <ErrorBoundary
          FallbackComponent={(props) => (
            <ErrorFallback 
              {...props}
              title={`工具加载失败(ID: ${tool.id || 'N/A'})`}
              message={props.error?.message}
              showStack={process.env.NODE_ENV === 'development'}
              retryText="重新加载"
            />
          )}
          onReset={() => {
            window.location.reload();
          }}
        >
          <UseTool
            id={tool.id}
            type={tool.type}
            content={tool.content}
            status={tool.status}
            isStreaming={isStreaming && isLatestBotMessage}
            calling={tool.calling}
            response={tool.response}
          />
        </ErrorBoundary>
      </Suspense>
    );
  }
  
  if (item.type === "other" && item.content) {
    if (item.content.startsWith("<agent-data>")) {
      return processAgentData(item.content);
    }
    
    if (item.content.startsWith("<thinking>")) {
      return processThinkingData(item.content);
    }
  }
  
  return null;
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
  
  const contentItems = useContentProcessor(content);

  return (
    <div className="group relative flex w-full items-start">
      <div className="flex-shrink-0 pl-3 sm:pl-0">
        <Avatar className="h-9 w-9">
          <MoonLogo className="relative p-1.5" />
        </Avatar>
      </div>

      <div className={cn(
        "flex flex-col min-w-0 flex-1 gap-1.5 ml-4 markdown",
        "group/message"
      )}>
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
              <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2" />
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
                />
              ))}
              {error && (
                <Suspense fallback={
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-1/4" />
                }>
                  <ErrorMessage error={error} />
                </Suspense>
              )}
            </>
          )}
        </div>

        <div className={cn(
          "transition-opacity duration-200 -ml-1 flex items-center",
          isLatestBotMessage && isStreaming && "hidden"
        )}>
          <Suspense fallback={null}>
            <MessageToolbar
              content={content}
              messageId={messageId}
              isLatestMessage={isLatestBotMessage}
              isStreaming={isStreaming}
              onRegenerate={() => {
                // 处理重新生成
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
});

BotMessage.displayName = "BotMessage";

// 类型声明
declare global {
  interface Window {
    __DEV_ERROR_HANDLER__?: (message: string, error: Error) => void;
  }
}

export default BotMessage;