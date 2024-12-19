import React, { useState, useMemo, Suspense } from "react";
import { cn } from '@/lib/utils/utils';
import { Loader2, Terminal, ChevronDown, Code2, Search, Calculator, Image, Globe, Cloud, AlertCircle } from "lucide-react";
import CodeBlock from "../markdown/code";
import { Image as MarkdownImage } from "../markdown/image";
import { Skeleton } from "../skeleton";
import { Button } from "../button";
import Link from "next/link";

type ToolType = "code" | "text" | "tool";
type ToolStatus = "input" | "calling" | "response";

interface PluginCallingProps {
  content: string;
  plugin_id: string;
  plugin_name: string;
}

export interface UseToolProps {
  id: string;
  message_id: string;
  type: ToolType;
  content?: string;
  status?: ToolStatus;
  isStreaming?: boolean;
  calling?: PluginCallingProps;
  response?: {
    data: {
      output?: any;
      returncode?: number;
      files?: Array<{
        filename: string;
        type: string;
        url: string;
      }>;
      error?: any;
      status?: string;
    };
    plugin_name: string;
  };
}

const Tool8Component = React.lazy(() => import('./tools/Tool8Component'));

// 工具名称映射表
const TOOL_NAMES: Record<string, string> = {
  '1': 'Blur 专业搜索',
  '2': '计算器',
  '4': 'Unsplash 搜索',
  '5': 'Python 解释器',
  '6': '查看网页',
  '8': '天气查询',
} as const;

// 工具图标映射
const TOOL_ICONS: Record<string, React.ComponentType> = {
  '1': Search,
  '2': Calculator,
  '4': Image as any,
  '5': Code2,
  '6': Globe,
  '8': Cloud,
} as const;


// 天气工具UI / (ID_8)
const Tool8Wrapper: React.FC<UseToolProps> = (props) => {
    const [useCustomUI, setUseCustomUI] = useState(true);
    if (!useCustomUI) {
        return <UseTool {...props} id="Original / 8" />;
      }
    
      return (
        <Suspense fallback={
          <div className="space-y-4 p-4 min-h-80">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        }>
          <Tool8Component 
            {...props} 
            onError={() => setUseCustomUI(false)}
          />
        </Suspense>
      );
    };
// 特殊的，需要单独界面定制的工具
const TOOL_COMPONENTS: Record<string, React.FC<UseToolProps>> = {
  '8': Tool8Wrapper
};

// 基础工具组件
const BaseUseTool: React.FC<UseToolProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const imageFiles = useMemo(() => {
    if (!props.response?.data?.files) return [];
    
    return props.response.data.files.filter(file => 
      file.type === 'image' && file.url
    );
  }, [props.response]);

  const processImageUrl = (url: string) => {
    return url
      .replace(/\[.*\]\((.*)\)/, '$1')
      .replace('sandbox:/', '/');
  };

  // 获取显示名称
  const getDisplayName = () => {
    // 优先使用插件返回的名称
    if (props.calling?.plugin_name) {
      return props.calling.plugin_name;
    }

    if (props.status === "response" && props.response?.plugin_name) {
      return props.response.plugin_name;
    }

    // 其次使用映射表中的名称
    const mappedName = TOOL_NAMES[props.id];
    if (mappedName) {
      return mappedName;
    }

    // 最后使用默认名称
    return props.type === "code" ? "代码执行" : "工具调用";
  };

  // 获取工具图标
  const ToolIcon = (props.id && TOOL_ICONS[props.id]) ? TOOL_ICONS[props.id] : (props.type === "code" ? Code2 : Terminal);

  // 判断是否为错误状态
  const isError = props.status === "input" && !props.isStreaming;

  // 渲染状态标签
  const renderStatus = () => {
    // 错误状态优先
    if (isError) {
        return (
            <Button
                variant="ghost"
                size="sm"
                tooltip={
                  <div className="flex flex-col gap-1 p-1 max-w-96">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                        <span className="font-medium text-sm">工具调用失败</span>
                      </div>
                      <div className="flex flex-col px-1.5 py-1 rounded bg-gray-800/40 text-[10px]">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400/90">tool:</span>
                          <code className="font-mono text-gray-300">{props.id}</code>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400/90">msg:</span>
                          <code className="font-mono text-gray-300">{props.message_id}</code>
                        </div>
                      </div>
                      <div className="text-[12px] text-gray-300/90">
                        请让Blur检查是否按照了正确的格式调用插件。如果依然出现问题，请
                        <Link 
                          href={`mailto:shuakami@sdjz.wiki?subject=Blur工具调用失败反馈&body=工具ID: ${props.id}%0A消息ID: ${props.message_id}%0A当前url: ${window.location.href}%0A设备信息: ${navigator.userAgent}%0A%0A问题描述：`}
                          target="_blank" 
                          className="text-blue-500 hover:text-blue-600"
                        >
                          点击这里
                        </Link>
                        反馈。
                      </div>
                    </div>
                  </div>
                }
                className="inline-flex items-center gap-1.5 px-2 py-0.5 hover:bg-transparent">
                <AlertCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                <span className="text-xs font-medium text-red-500 dark:text-red-400">
                    调用失败
                </span>
            </Button>
        );
    }

    switch (props.status) {
      case "input":
        return (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>输入中...</span>
          </div>
        );
      case "calling":
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              执行中
            </span>
          </div>
        );
      case "response":
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              已完成
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  // 渲染输出结果
  const renderOutput = () => {
    if (props.status === "response" && props.response) {
      return (
        <div className="bg-gray-100/70 dark:bg-gray-900 rounded-md p-4 space-y-3 h-full">
          <div className="text-xs font-medium text-gray-400">
            输出结果
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <CodeBlock
              code={
                typeof props.response.data === "string"
                  ? props.response.data
                  : JSON.stringify(props.response.data, null, 2)
              }
              language="json"
              forceRenderBlock={true}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      "my-4 rounded-xl border border-gray-200 dark:border-gray-800",
      "transition-all duration-300 ease-in-out",
      "hover:border-gray-300 dark:hover:border-gray-700",
      "grid grid-rows-[auto_0fr]",
      isExpanded && "grid-rows-[auto_1fr]"
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full px-4 py-3 flex items-center justify-between",
          "bg-gray-50/50 dark:bg-gray-900/50",
          "transition-colors duration-300",
          "hover:bg-gray-100/70 dark:hover:bg-gray-800/70",
          isExpanded ? "rounded-t-xl" : "rounded-xl"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 transition-transform duration-200 hover:scale-105">
            <ToolIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-medium">
            {getDisplayName()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {renderStatus()}
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-300",
            isExpanded && "rotate-180"
          )} />
        </div>
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-300",
        "opacity-0 scale-y-95",
        isExpanded && "opacity-100 scale-y-100"
      )}>
        {(props.content || props.response) && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            {props.content && (
              <div className="px-4 py-2">
                <CodeBlock
                  code={props.content}
                  language={props.type === "code" ? "python" : "text"}
                  forceRenderBlock={true}
                />
              </div>
            )}
            {props.status === "response" && props.response && renderOutput()}
          </div>
        )}
      </div>

      {/* 图片区域 */}
      {imageFiles.length > 0 && (
        <div className="mt-4 grid gap-2">
          {imageFiles.map(file => (
            <div 
              key={file.url}
              className="rounded-xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
            >
              <MarkdownImage
                src={processImageUrl(file.url)}
                alt={file.filename}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 主组件
const UseTool: React.FC<UseToolProps> = (props) => {
  const SpecificToolComponent = TOOL_COMPONENTS[props.id];
  if (SpecificToolComponent) {
    return <SpecificToolComponent {...props} />;
  }
  return <BaseUseTool {...props} />;
};

export default UseTool;
