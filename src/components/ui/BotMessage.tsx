import React, { memo, lazy, Suspense, useEffect, useState } from "react";
import { ThoughtProcess } from "@/types/stream";
import { Avatar } from "@/components/ui/avatar";
import MoonLogo from "../../../pages/logo";
import { useChatStateContext } from "@/app/[上下文]/ChatContext";
import MarkdownRenderer from "@/components/ui/markdown/MarkdownRenderer";
import { cn } from '../../lib/utils/utils';
import { Agent } from "./LLM/agent";

// 懒加载组件保持不变
const AnimatedShinyText = lazy(() => 
  import("./animated-shiny-text").then((mod) => ({
    default: mod.default || (() => null),
  }))
);

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

const BotMessage = memo(({
  content,
  messageId,
  isLoading,
  isLatestBotMessage,
  thought,
  error,
}: BotMessageProps) => {
  const { isStreaming } = useChatStateContext();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    const processContent = (): ContentItem[] => {
      const items: ContentItem[] = [];
      const parts = splitContent(content);
      
      const toolQueue: ToolState[] = [];
      let isCollectingTool = false;

      parts.forEach(part => {
        if (part.startsWith("[USE_TOOL") && !part.includes("[USE_TOOL/]")) {
          // 匹配开始标签
          const match = part.match(/\[USE_TOOL type="(code|text)" id="([^"]+)"\]/);
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
          // 直接更新最后一个tool的content
          const currentTool = toolQueue[toolQueue.length - 1];
          currentTool.content = (currentTool.content || '') + part;
        } else if (part.startsWith("<plugin-data>")) {
          // 解析 <plugin-data>
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
                // 完成匹配，移出队列
                toolQueue.shift();
              }
            } else {
              // 没有匹配的 [USE_TOOL]，将其视为普通文本
              items.push({
                type: "text",
                content: part
              });
            }
          } catch (e) {
            console.error("插件数据解析失败:", e);
            items.push({
              type: "text",
              content: part
            });
          }
        } else if (part.startsWith("<agent-data>") || part.startsWith("<thinking>")) {
          // 处理 <agent-data> 和 <thinking>
          items.push({
            type: "other",
            content: part
          });
        } else if (part.trim()) {
          // 处理普通文本
          items.push({
            type: "text",
            content: part
          });
        }
      });

      return items;
    };

    const newItems = processContent();
    setContentItems(newItems);
  }, [content]);

  // 分割内容的函数
  const splitContent = (content: string): string[] => {
    // 分别匹配开始标签、结束标签和其他标签
    return content.split(
      /(\[USE_TOOL[^\]]*\]|\[USE_TOOL\/\]|<plugin-data>.*?<\/plugin-data>|<agent-data>.*?<\/agent-data>|<thinking>.*?<\/thinking>)/s
    );
  };

  // 渲染Agent内容
  const renderAgentContent = (part: string, index: number): React.ReactNode => {
    if (!part.startsWith("<agent-data>")) return null;
    try {
      const agentInfo = JSON.parse(
        part.replace("<agent-data>", "").replace("</agent-data>", "")
      );
      return (
        <Suspense key={index} fallback={null}>
          <Agent data={agentInfo} />
        </Suspense>
      );
    } catch (e) {
      console.error("Agent 数据解析失败:", e);
      return null;
    }
  };

  // 渲染思考内容
  const renderThinkingContent = (part: string, index: number): React.ReactNode => {
    if (!part.startsWith("<thinking>")) return null;
    try {
      const thoughtContent = part
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
      console.error("Thinking 数据解析失败:", e);
      return null;
    }
  };

  return (
    <div className="group relative flex w-full items-start">
      <div className="flex-shrink-0 pl-3 sm:pl-0">
        <Avatar className="h-9 w-9">
          <MoonLogo className="relative p-1.5" />
        </Avatar>
      </div>

      <div className="flex flex-col min-w-0 flex-1 gap-1.5 ml-4 markdown">
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
              {contentItems.map((item, index) => {
                if (item.type === "text") {
                  return (
                    <MarkdownRenderer
                      key={index}
                      content={item.content || ""}
                      isStreaming={isStreaming && isLatestBotMessage}
                    />
                  );
                } else if (item.type === "group" && item.group) {
                  return (
                    <Suspense key={index} fallback={null}>
                      <UseTool
                        id={item.group.useTool.id}
                        type={item.group.useTool.type}
                        content={item.group.useTool.content}
                        status={item.group.useTool.status}
                        isStreaming={isStreaming && isLatestBotMessage}
                        calling={item.group.useTool.calling}
                        response={item.group.useTool.response}
                      />
                    </Suspense>
                  );
                } else if (item.type === "other") {
                  if (item.content?.startsWith("<agent-data>")) {
                    return renderAgentContent(item.content, index);
                  } else if (item.content?.startsWith("<thinking>")) {
                    return renderThinkingContent(item.content, index);
                  }
                }
                return null;
              })}
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
          isLatestBotMessage && !isStreaming
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
          isLatestBotMessage && isStreaming && "hidden"
        )}>
          <Suspense fallback={null}>
            <MessageToolbar
              content={content}
              messageId={messageId}
              isLatestMessage={isLatestBotMessage}
              isStreaming={isStreaming || false}
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
export default BotMessage;
