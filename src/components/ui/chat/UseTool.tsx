import React, { useState, useMemo, Suspense } from "react";
import { cn } from '@/lib/utils/utils';
import { Loader2, Terminal, ChevronDown, Code2, Search, Calculator, Image, Globe, Cloud, AlertCircle } from "lucide-react";
import CodeBlock from "../markdown/code";
import { Image as MarkdownImage } from "../markdown/image";
import { Skeleton } from "../skeleton";
import { Button } from "../button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

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
          <div className="space-y-4 py-4 px-1 min-h-80">
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

const BaseUseTool: React.FC<UseToolProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 清理工具内函数
  const cleanContent = (content: string) => {
    return content
      ?.replace(/\[USE.*?\]\n*/, '') // 清理[USE...]后的换行
      .replace(/```/g, '') // 清理```标记
      .replace(/\n+/g, ' '); // 将连续换行替换为单个空格
  };

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

    // 最后使用默认名
    return props.type === "code" ? "代码执行" : "工具调用";
  };

  // 获取工具图标
  const ToolIcon = (props.id && TOOL_ICONS[props.id]) ? TOOL_ICONS[props.id] : (props.type === "code" ? Code2 : Terminal);

  // 判断是否为错误状态
  const isError = props.status === "input" && !props.isStreaming;



  // 渲染输出结果
  const renderOutput = () => {
    if (props.status === "response" && props.response) {
      return (
        <div className="bg-gray-100/70 -mt-1 dark:bg-gray-900 rounded-md p-4 space-y-3 h-full">
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

  // 渲染错误状态UI
  const renderErrorState = () => {
    return (
      <Button
        variant="ghost"
        size="sm"
        tooltip={
          <div className="flex flex-col gap-1 p-1 max-w-96">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 dark:text-red-300" />
                <span className="font-medium text-sm text-gray-800 dark:text-gray-200">工具调用失败</span>
              </div>
              <div className="flex flex-col px-1.5 py-1 rounded bg-gray-800/40 dark:bg-gray-900/40 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400/90 dark:text-gray-500">tool:</span>
                  <code className="font-mono text-gray-300 dark:text-gray-200">{props.id}</code>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400/90 dark:text-gray-500">msg:</span>
                  <code className="font-mono text-gray-300 dark:text-gray-200">{props.message_id}</code>
                </div>
              </div>
              <div className="text-[12px] text-gray-300/90 dark:text-gray-400">
                请让Blur检查是否按照了正确的格式调用插件。如果依然出现问题，请
                <Link 
                  href={`mailto:shuakami@sdjz.wiki?subject=Blur工具调用失败反馈&body=工具ID: ${props.id}%0A消息ID: ${props.message_id}%0A当前url: ${window.location.href}%0A设备信息: ${navigator.userAgent}%0A%0A问题描述：`}
                  target="_blank" 
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
                >
                  点击这里
                </Link>
                反馈。
              </div>
            </div>
          </div>
        }
        className="inline-flex items-center gap-1.5 px-2 py-0.5 hover:bg-transparent"
      >
        <div className="relative">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
        </div>
        <span className="text-xs font-medium text-red-500 dark:text-red-400">
          调用失败
        </span>
      </Button>
    );
  };

  return (
    <div className="my-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative [--hover:0] hover:[--hover:1] inline-flex items-center py-1.5 rounded-md"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ToolIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div className="absolute -right-1 -bottom-1">
              {props.status === "response" ? (
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              ) : props.status === "calling" ? (
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              ) : props.status === "input" ? (
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              ) : null}
            </div>
          </div>

          <motion.span 
            className={cn(
              "text-sm truncate",
              "text-gray-600 dark:text-gray-300",
              "transition-colors duration-200",
              "brightness-[calc(100%-var(--hover)*15%)]",
              props.status === "calling" && "shine-effect",
            )}
            animate={
              props.status === "input" ? {
                opacity: 1,
                transition: { duration: 0 }
              } : undefined
            }
          >
            {props.status === "input" ? (
              <motion.div className="flex">
                {getDisplayName().split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.05,  // 每个字符的显示时间
                      delay: index * 0.05,  // 错开每个字符的显示时间
                      ease: "easeOut"
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              getDisplayName()
            )}
          </motion.span>

          {isError && renderErrorState()}

          <ChevronDown className={cn(
            "h-3.5 w-3.5 ml-auto",
            "text-gray-400 transition-colors duration-200",
            "brightness-[calc(100%-var(--hover)*15%)]",
            isExpanded && "rotate-180"
          )} />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ 
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1] 
            }}
            className="overflow-hidden"
          >
            <div className="mt-1 rounded-md overflow-hidden">
              {/* 参数部分 */}
              {props.content && (
                <div className="px-2 py-3 bg-gray-50/70 dark:bg-gray-900/50">
                  <CodeBlock
                    code={cleanContent(props.content)}
                    language={props.type === "code" ? "python" : "javascript"}
                    forceRenderBlock={true}
                  />
                </div>
              )}
              
              {/* 输出结果部分 */}
              {props.status === "response" && props.response && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {renderOutput()}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 图片区域 */}
      <AnimatePresence mode="wait">
        {imageFiles.length > 0 && (
          <motion.div 
            key="images"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 grid gap-2"
          >
            {imageFiles.map((file, index) => (
              <motion.div 
                key={file.url}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.2
                }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400 }
                }}
                className="rounded-xl overflow-hidden"
              >
                <MarkdownImage
                  src={processImageUrl(file.url)}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 主组件
const UseTool: React.FC<UseToolProps> = (props) => {
  console.log('[UseTool] Incoming props:', {
    id: props.id,
    type: props.type,
    status: props.status
  });

  const SpecificToolComponent = TOOL_COMPONENTS[props.id];
  if (SpecificToolComponent) {
    console.log('[UseTool] Using specific component for tool:', props.id);
    return <SpecificToolComponent {...props} />;
  }
  
  
  return <BaseUseTool {...props} />;
};

export default UseTool;