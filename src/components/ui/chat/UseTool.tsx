import React, { useState, useMemo } from "react";
import { cn } from '../../../lib/utils/utils';
import { Loader2, Terminal, ChevronDown, Code2 } from "lucide-react";
import CodeBlock from "../markdown/code";
import { Image } from "../markdown/image";

type ToolType = "code" | "text";
type ToolStatus = "input" | "calling" | "response";

interface PluginCallingProps {
  content: string;
  plugin_id: string;
  plugin_name: string;
}

interface UseToolProps {
  id: string;
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

const UseTool: React.FC<UseToolProps> = ({
  id,
  type,
  content,
  status,
  isStreaming,
  calling,
  response,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 处理图片文件
  const imageFiles = useMemo(() => {
    if (!response?.data?.files) return [];
    
    return response.data.files.filter(file => 
      file.type === 'image' && file.url
    );
  }, [response]);

  // 处理图片 URL
  const processImageUrl = (url: string) => {
    return url
      .replace(/\[.*\]\((.*)\)/, '$1') // 提取markdown链接中的URL
      .replace('sandbox:/', '/');  // 替换sandbox路径
  };

  // 获取显示名称
  const getDisplayName = () => {
    if (calling?.plugin_name) {
      return calling.plugin_name;
    }

    if (status === "response" && response?.plugin_name) {
      return response.plugin_name;
    }

    return type === "code" ? "代码执行" : "文本处理";
  };

  // 渲染状态徽章
  const renderStatus = () => {
    switch (status) {
      case "input":
        return (
          <div className="flex items-center gap-2 text-xs text-gray-500">
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
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>已完成</span>
          </div>
        );
      default:
        return null;
    }
  };

  // 渲染输出结果
  const renderOutput = () => {
    if (status === "response" && response) {
      return (
        <div className="bg-gray-100/70 dark:bg-gray-900 rounded-md p-4 space-y-3 h-full">
          <div className="text-xs font-medium text-gray-400">
            输出结果
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <CodeBlock
              code={
                typeof response.data === "string"
                  ? response.data
                  : JSON.stringify(response.data, null, 2)
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
    <>
      <div className="my-4 rounded-xl border border-gray-200 dark:border-gray-800">
        {/* 头部 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
              {type === "code" ? (
                <Code2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <Terminal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium">
                {getDisplayName()} #{id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {renderStatus()}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded ? "rotate-0" : "-rotate-90"
              )}
            />
          </div>
        </button>

        {/* 内容区域 */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isExpanded ? "h-full" : "max-h-0"
          )}
        >
          {(content || response) && (
            <div className="border-t border-gray-100 dark:border-gray-800">
              {content && (
                <div className="px-4 py-2">
                  <div className="-mt-6">
                    <CodeBlock
                      code={content}
                      language={type === "code" ? "python" : "text"}
                      forceRenderBlock={true}
                    />
                  </div>
                </div>
              )}

              {status === "response" && response && renderOutput()}
            </div>
          )}
        </div>
      </div>

      {/* 图片展示区域 */}
      {imageFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {imageFiles.map((file, index) => (
            <div 
              key={file.url}
              className="rounded-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
              onMouseEnter={e => e.stopPropagation()}
            >
              <Image
                src={processImageUrl(file.url)}
                alt={file.filename}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default UseTool;
