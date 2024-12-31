import React, { useState, useMemo, useCallback, Suspense } from "react";
import { cn } from '@/lib/utils/utils';
import { Terminal, ChevronDown, Code2, Search, Calculator, Image, Globe, Cloud, AlertCircle, Github } from "lucide-react";
import CodeBlock from "../markdown/code";
import { Image as MarkdownImage } from "../markdown/image";
import { Skeleton } from "../skeleton";
import { Button } from "../button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import '@/components/ui/ThoughtStream.css';
import { CARD_STYLES } from "./tools/components/github/constants";

// 常量定义
const ANIMATION_CONFIG = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1]
} as const;

const IMAGE_ANIMATION_CONFIG = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: ANIMATION_CONFIG.duration }
} as const;

const EXPAND_ANIMATION_CONFIG = {
  initial: { height: 0 },
  animate: { height: "auto" },
  exit: { height: 0 },
  transition: { 
    duration: ANIMATION_CONFIG.duration,
    ease: ANIMATION_CONFIG.ease
  }
} as const;

const MAX_HEIGHT = 300;
const STATUS_COLORS = {
  response: "bg-green-500",
  calling: "bg-amber-400",
  input: "bg-blue-400"
} as const;

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
const Tool9Component = React.lazy(() => import('./tools/Tool9Component'));

// 工具名称映射表
const TOOL_NAMES: Record<string, string> = {
  '1': 'Blur 专业搜索',
  '2': '计算器',
  '4': 'Unsplash 搜索',
  '5': 'Python 解释器',
  '6': '查看网页',
  '8': '天气查询',
  '9': 'GitHub',
} as const;

// 工具图标映射
const TOOL_ICONS: Record<string, React.ComponentType> = {
  '1': Search,
  '2': Calculator,
  '4': Image as any,
  '5': Code2,
  '6': Globe,
  '8': Cloud,
  '9': Github,
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

// GitHub工具UI / (ID_9)
const Tool9Wrapper: React.FC<UseToolProps> = (props) => {
    const [useCustomUI, setUseCustomUI] = useState(true);
    if (!useCustomUI) {
        return <UseTool {...props} id="Original / 9" />;
    }
    
    return (
        <Suspense fallback={
            <div className="space-y-4 py-4 px-1">
            <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, "space-y-4")}>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-[80%]" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        }>
          <Tool9Component 
            {...props} 
            onError={() => setUseCustomUI(false)}
          />
        </Suspense>
    );
};

// 特殊的，需要单独界面定制的工具
const TOOL_COMPONENTS: Record<string, React.FC<UseToolProps>> = {
  '8': Tool8Wrapper,
  '9': Tool9Wrapper
};

const BaseUseTool: React.FC<UseToolProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 优化状态更新
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // 优化内容清理函数
  const cleanContent = useMemo(() => {
    if (!props.content) return "";
    
    const content = props.content.trim();
    
    // 预处理：移除可能的前缀标记
    const preprocessed = content
      .replace(/^\[USE.*?\][\n\s]*/i, '')
      .replace(/^```[\w]*[\n\s]*/g, '')
      .replace(/[\n\s]*```$/g, '');
    
    try {
      // 尝试解析 JSON
      const jsonContent = JSON.parse(preprocessed);
      
      // 如果是代码内容
      if (jsonContent.code) {
        return jsonContent.code
          .replace(/^\s*[\n\r]/g, '') // 移除开头空行
          .replace(/[\n\r]\s*$/g, '') // 移除结尾空行
          .replace(/\n{3,}/g, '\n\n'); // 将多个连续空行减少为两个
      }
      
      // 如果是普通 JSON 对象，美化输出
      return JSON.stringify(jsonContent, null, 2);
    } catch {
      // JSON 解析失败，作为普通文本处理
      return preprocessed
        .replace(/^\s*[\n\r]/g, '')
        .replace(/[\n\r]\s*$/g, '')
        .split(/\n/)
        .map(line => line.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }
  }, [props.content]);

  // 优化图片处理
  const imageFiles = useMemo(() => {
    if (!props.response?.data?.files) return [];
    return props.response.data.files.filter(file => 
      file.type === 'image' && file.url
    );
  }, [props.response]);

  const processImageUrl = useCallback((url: string) => {
    return url
      .replace(/\[.*\]\((.*)\)/, '$1')
      .replace('sandbox:/', '/');
  }, []);

  // 优化显示名称获取
  const displayName = useMemo(() => {
    if (props.calling?.plugin_name) {
      return props.calling.plugin_name;
    }

    if (props.status === "response" && props.response?.plugin_name) {
      return props.response.plugin_name;
    }

    const mappedName = TOOL_NAMES[props.id];
    if (mappedName) {
      return mappedName;
    }

    return props.type === "code" ? "代码执行" : "工具调用";
  }, [props.calling?.plugin_name, props.status, props.response?.plugin_name, props.id, props.type]);

  // 优化工具图标获取
  const ToolIcon = useMemo(() => 
    (props.id && TOOL_ICONS[props.id]) ? TOOL_ICONS[props.id] : (props.type === "code" ? Code2 : Terminal),
    [props.id, props.type]
  );

  const isError = props.status === "input" && !props.isStreaming;

  // 优化输出结果渲染
  const outputContent = useMemo(() => {
    if (props.status !== "response" || !props.response) return null;
    
    return typeof props.response.data === "string"
      ? props.response.data
      : JSON.stringify(props.response.data, null, 2);
  }, [props.status, props.response]);

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
        onClick={toggleExpanded}
        className="relative [--hover:0] hover:[--hover:1] inline-flex items-center py-1.5 rounded-md"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ToolIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div className="absolute -right-1 -bottom-1">
              {props.status && (
                <div className={cn("h-1.5 w-1.5 rounded-full", STATUS_COLORS[props.status])} />
              )}
            </div>
          </div>

          <motion.span 
            className={cn(
              "text-sm truncate",
              "text-gray-600 dark:text-gray-300",
              "transition-colors duration-200",
              "hover:text-gray-900 dark:hover:text-gray-100",
              "brightness-[calc(100%-var(--hover)*25%)]",
              props.status === "calling" && "shine-effect",
            )}
            animate={props.status === "input" ? {
              opacity: 1,
              transition: { duration: 0 }
            } : undefined}
          >
            {props.status === "input" ? (
              <motion.div className="flex">
                {displayName.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.05,
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              displayName
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
            {...EXPAND_ANIMATION_CONFIG}
            className="overflow-hidden"
          >
            <div className="mt-1 rounded-md overflow-hidden">
              {props.content && (
                <div className="p-4 bg-gray-50/70 dark:bg-gray-900/50">
                  <div className="whitespace-pre overflow-x-auto">
                    <CodeBlock
                      code={cleanContent}
                      language={props.type === "code" ? "python" : "javascript"}
                      forceRenderBlock={true}
                    />
                  </div>
                </div>
              )}
              
              {outputContent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-gray-100/70 dark:bg-gray-900 rounded-md p-4 space-y-3 h-full">
                    <div className="text-xs font-medium text-gray-400">
                      输出结果
                    </div>
                    <div className={`max-h-[${MAX_HEIGHT}px] overflow-y-auto`}>
                      <div className="whitespace-pre overflow-x-auto">
                        <CodeBlock
                          code={typeof outputContent === 'string' ? outputContent.trim() : outputContent}
                          language={
                            (typeof outputContent === 'string' && 
                             (outputContent.trim().startsWith('{') || outputContent.trim().startsWith('['))) 
                            ? "json" 
                            : "plaintext"
                          }
                          forceRenderBlock={true}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {imageFiles.length > 0 && (
          <motion.div 
            key="images"
            {...IMAGE_ANIMATION_CONFIG}
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
                  transition: { 
                    type: "spring", 
                    stiffness: 400,
                    willChange: "transform",
                    useHardwareAcceleration: true
                  }
                }}
                className="rounded-xl overflow-hidden"
              >
                <MarkdownImage
                  src={processImageUrl(file.url)}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                  priority={false}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 主组件优化
const UseTool: React.FC<UseToolProps> = (props) => {
  // 移除开发日志
  const SpecificToolComponent = TOOL_COMPONENTS[props.id];
  if (SpecificToolComponent) {
    return <SpecificToolComponent {...props} />;
  }
  
  return <BaseUseTool {...props} />;
};

export default UseTool;