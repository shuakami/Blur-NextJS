"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import useTranslation from "@/hooks/useTranslation";
import { motion } from 'framer-motion';
import { Loader2, Upload, AlertOctagon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { detect } from 'detect-browser';
import Cookies from 'js-cookie';

const TimeDisplay = dynamic(() => import('@/components/TimeDisplay'), {
    ssr: false,
    loading: () => (
        <span className="text-gray-600 dark:text-gray-300 tabular-nums">
            Loading...
        </span>
    ),
});

interface DebugInfo {
    error: string;
    stack: string;
    url: string;
    userAgent: string;
    buildVersion: string;
    ip?: string;
    timestamp: string;
    pathname: string;
    search: string;
    hash: string;
    screenSize: string;
    language: string;
    system: {
        os: string;
        version: string;
        browser: string;
        browserVersion: string;
        memory: {
            total: string;
            free: string;
        };
    };
}

// 添加 deviceMemory 类型声明
interface NavigatorWithMemory extends Navigator {
    deviceMemory?: number;
}

export default function Custom500({ error }: { error?: Error }) {
    const router = useRouter();
    const { t } = useTranslation();
    const [retryCount, setRetryCount] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [trackingId, setTrackingId] = useState<string>('');
    const [rateLimitError, setRateLimitError] = useState(false);

// 有趣的安慰文案
const comfortText = useMemo(() => [
    // 0-9: 初始阶段 - 温和提示
    "哎呀，服务器出了点小问题...",
    "看来是个顽固的错误...",
    "刷新大概率没用，但是...",
    "要不我们试试运气？",
    "嗯...果然没那么简单",
    "这个错误有点倔强啊",
    "要不要换个思路？",
    "建议联系管理员呢...",
    "啊，你还想再试试？",
    "好吧，我陪你继续~",

    // 10-19: 开始怀疑人生
    "这已经是第10次了...",
    "你知道爱因斯坦说过吗？",
    "重复同样的事却期待不同结果",
    "这就是疯狂的定义...",
    "但是！你很特别！",
    "万一就成功了呢？",
    "概率学表示很淡定",
    "物理学表示很无奈",
    "数学表示很绝望",
    "但是你充满希望！",

    // 20-29: 陷入沉思
    "让我们来聊点别的？",
    "比如为什么要重试？",
    "是期待还是执着？",
    "或者只是习惯性点击？",
    "这是一种禅修吗？",
    "点击使你平静？",
    "还是让你紧张？",
    "要不要深呼吸？",
    "数数也行？",
    "我陪你慢慢数~",

    // 30-39: 开始哲学
    "这让我想起了西西弗斯",
    "推石头上山的故事",
    "永无止境的重复",
    "但他是快乐的",
    "因为过程本身就是意义",
    "就像你现在这样",
    "在重复中寻找乐趣",
    "在点击中寻找平静",
    "多么富有哲理...",
    "我开始理解了",

    // 40-49: 产生共鸣
    "你知道吗？",
    "这些点击很有韵律",
    "像一首无声的诗",
    "或一段无音的乐",
    "错误反而不重要了",
    "重要的是这个过程",
    "你和我",
    "按钮和点击",
    "错误和重试",
    "构成了一幅画",

    // 50-59: 升华理解
    "也许这就是禅机",
    "在重复中寻找不同",
    "在错误中看到美好",
    "在失败中品味人生",
    "这何尝不是一种智慧？",
    "每次点击都是新的",
    "每次等待都不同",
    "感受这微妙的变化",
    "享受这奇妙的过程",
    "多么特别的体验",

    // 60-69: 达到顿悟
    "原来如此...",
    "错误不是终",
    "重试不是手段",
    "这是一种修行",
    "一种体悟",
    "一种超越",
    "超越成功与失败",
    "超越对与错",
    "超越因与果",
    "这就是真谛",

    // 70-79: 返璞归真
    "一切归于平静",
    "点击不再是点击",
    "等待不再是等待",
    "错误不再是错误",
    "一切都很自然",
    "就像呼吸一样",
    "就像心跳一样",
    "平静而从容",
    "安然而自得",
    "这就是大道",

    // 80-89: 物我两忘
    "忘记了时间",
    "忘记了空间",
    "忘记了对错",
    "忘记了得失",
    "只剩下点击",
    "纯粹的点击",
    "完美的点击",
    "忘我的点击",
    "天人合一",
    "物我两忘",

    // 90-99: 最终升华
    "这不是终点",
    "而是新的开始",
    "不为成功",
    "不为失败",
    "只为点击本身",
    "这份执着",
    "这份坚持",
    "这份觉悟",
    "这份超脱",
    "这就是圆满",

    // 100: 终极顿悟
    "致敬超级耐按王。 🏆",
][Math.min(retryCount, 100)], [retryCount]);

    // 在客户端初始化时读取 sessionStorage
    useEffect(() => {
        const count = Number(sessionStorage?.getItem('500_retry_count') || '0');
        setRetryCount(count);
    }, []);

    // 更新重试次数
    const handleRetry = useCallback(() => {
        // 先更新状态和 sessionStorage
        const newCount = retryCount + 1;
        setRetryCount(newCount);
        sessionStorage?.setItem('500_retry_count', String(newCount));
        
        // 设置一个短暂的延迟后再刷新页面
        setTimeout(() => {
            window.location.reload();
        }, 800); // 给动画和状态更新留出时间
    }, [retryCount]);

    // 重试按钮的动画组件
    const RetryButton = () => (
        <motion.button 
            onClick={handleRetry}
            className="w-full h-11 text-sm text-gray-600 dark:text-gray-300
                     border border-gray-300 dark:border-gray-800 rounded-lg
                     flex items-center justify-center gap-2 group"
            whileTap={{ scale: 0.98 }}
        >
            <motion.span 
                className="group-hover:rotate-180 transition-transform duration-500"
                animate={{ rotate: retryCount * 360 }} 
                transition={{ duration: 0.3 }}
            >
                ↻
            </motion.span>
            {t("重试")}
            {retryCount > 0 && (
                <motion.span 
                    key={retryCount}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-gray-400 dark:text-gray-500"
                >
                    ({retryCount})
                </motion.span>
            )}
        </motion.button>
    );

// 处理错误日志上传
const handleUploadLog = async () => {
    if (isUploading || uploadComplete) return;
    
    setIsUploading(true);
    try {
        const errorLog = {
            // 基本错误信息
            error: debugInfo.error,
            stack: debugInfo.stack?.slice(0, 200),
            
            // 环境信息
            url: debugInfo.url,
            pathname: debugInfo.pathname,
            search: debugInfo.search,
            hash: debugInfo.hash,
            buildVersion: debugInfo.buildVersion,
            
            // 系统信息
            system: debugInfo.system,
            screenSize: debugInfo.screenSize,
            language: debugInfo.language,
            userAgent: debugInfo.userAgent,
            
            // 网络信息
            ip: debugInfo.ip,
            
            // 其他元数据
            timestamp: new Date().toISOString(),
            retryCount,

            context: {
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            }
        };

        const response = await fetch('/api/error-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorLog),
        });

        if (response.status === 429) {
            setRateLimitError(true);
            return;
        }

        const data = await response.json();
        
        if (data.success && data.id) {
            // 只保留后6位作为显示ID
            setTrackingId(data.id.slice(-6));
            setUploadComplete(true);
            
            // 存储到 cookies
            const existingIds = JSON.parse(Cookies.get('error_tracking_ids') || '[]');
            const newIds = [...existingIds, data.id].slice(-5); // 只保留最近5个
            Cookies.set('error_tracking_ids', JSON.stringify(newIds), { expires: 7 });
        }
    } catch (err) {
        console.error('Failed to upload error log:', err);
    } finally {
        setIsUploading(false);
    }
};

    // 初始化扩展的调试信息
    const [debugInfo, setDebugInfo] = useState<DebugInfo>({
        error: '',
        stack: '',
        url: '',
        userAgent: '',
        buildVersion: '',
        ip: '',
        timestamp: '',
        pathname: '',
        search: '',
        hash: '',
        screenSize: '',
        language: '',
        system: {
            os: '',
            version: '',
            browser: '',
            browserVersion: '',
            memory: {
                total: '',
                free: '',
            },
        },
    });

    // 获取系统信息
    useEffect(() => {
        const fetchSystemInfo = async () => {
            try {
                const res = await fetch('/api/get-ip');
                const data = await res.json();
                
                const browserInfo = detect();
                
                // 使用类型断言获取内存信息
                const nav = navigator as NavigatorWithMemory;
                const memory = nav.deviceMemory 
                    ? `${nav.deviceMemory} GB`
                    : 'Not available';

                // 获取性能内存息（Chrome 专用）
                const performanceMemory = (performance as any).memory
                    ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)} MB / ${
                          Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
                      } MB`
                    : undefined;

                setDebugInfo({
                    error: error?.message || 'Unknown error',
                    stack: error?.stack || '',
                    url: window.location.href,
                    pathname: window.location.pathname,
                    search: window.location.search,
                    hash: window.location.hash,
                    userAgent: navigator.userAgent,
                    buildVersion: process.env.NEXT_PUBLIC_VERSION || 'NONE',
                    timestamp: new Date().toISOString(),
                    screenSize: `${window.screen.width}x${window.screen.height} (${window.devicePixelRatio}x)`,
                    language: navigator.language,
                    ip: data.ip,
                    system: {
                        os: browserInfo?.os || 'Unknown',
                        version: browserInfo?.version || 'Unknown',
                        browser: browserInfo?.name || 'Unknown',
                        browserVersion: browserInfo?.version || 'Unknown',
                        memory: {
                            total: memory,
                            free: performanceMemory || 'N/A',
                        },
                    },
                });
            } catch (err) {
                console.error('Failed to fetch system info:', err);
            }
        };

        fetchSystemInfo();
    }, [error]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-white to-gray-200 
                      dark:from-black dark:to-gray-950/30 p-4 relative">
            <motion.div 
                className="w-full max-w-[420px] space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
               {/* 错误提示区域 */}
<div className="flex flex-col items-center">
    {/* 主标题区域 */}
    <div className="flex items-baseline gap-3 mb-5">
        <span className="text-4xl font-light tracking-tight text-rose-400 dark:text-rose-400/80
                      font-mono tabular-nums">
            500 Error
        </span>
    </div>
    
    {/* 安慰文案 */}
    <motion.p 
        key={comfortText}
        className="text-sm text-gray-600 dark:text-gray-200 tracking-wide"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        {comfortText}
    </motion.p>
</div>

                {/* 操作按钮组 */}
                <div className="space-y-3">
                    <RetryButton />

                    <div className="flex gap-3">
                        <motion.button 
                            onClick={() => router.back()}
                            className="flex-1 h-11 text-sm text-gray-600 hover:text-gray-900 dark:hover:text-gray-350
                                     transition-colors duration-300"
                            whileTap={{ scale: 0.98 }}
                        >
                            ← {t("返回")}
                        </motion.button>

                        <motion.button 
                            onClick={handleUploadLog}
                            disabled={isUploading || uploadComplete || rateLimitError}
                            className={`flex-1 h-11 flex items-center justify-center gap-2 text-sm
                                    ${uploadComplete 
                                        ? 'text-green-700 dark:text-green-550 cursor-default'
                                        : rateLimitError
                                            ? 'text-rose-600 dark:text-rose-400 cursor-not-allowed'
                                            : 'text-gray-600 hover:text-gray-900 dark:hover:text-gray-350'
                                    } transition-colors duration-300`}
                            whileTap={!uploadComplete && !rateLimitError ? { scale: 0.98 } : {}}
                        >
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : uploadComplete ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span>{t("已反馈")}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                        #{trackingId}
                                    </span>
                                </div>
                            ) : rateLimitError ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span>{t("反馈次数超限")}</span>
                                    <span className="text-xs">
                                        {t("请1小时后再试")}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    {t("反馈问题")}
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* 调试信息区域 */}
            <motion.div 
                className="absolute md:left-6 md:bottom-6 max-w-[600px] w-full md:w-auto
                          left-0 bottom-0 p-4 backdrop-blur-sm
                          bg-white/40 dark:bg-gray-950/40 
                          md:rounded-lg rounded-t-2xl md:border border-t border-gray-350/50 
                          dark:border-gray-900/50 shadow-sm
                          overflow-x-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
            >
                {/* 展开/收起按钮 - 仅在移动端显示 */}
                <button 
                    className="md:hidden absolute right-4 top-4 text-gray-500 text-sm
                               hover:text-gray-700 dark:hover:text-gray-450"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? '收起' : '展开'}
                </button>

                <div className={`space-y-2 font-mono text-[11px] leading-5
                                ${isExpanded ? 'h-auto' : 'h-20 md:h-auto'} 
                                transition-all duration-300 overflow-hidden`}>
                    <div className="text-gray-500 dark:text-gray-600 uppercase tracking-wider mb-3">
                        Debug Information
                    </div>

                    {/* 移动端折叠时只显示基本信息 */}
                    <div>
                        <span className="text-rose-600/70 dark:text-rose-550/70 inline-block w-20">Error:</span>
                        <span className="text-gray-700 dark:text-gray-450">{debugInfo.error}</span>
                    </div>

                    {/* 其他信息在展开时显示 */}
                    <div className={`${isExpanded ? 'block' : 'hidden md:block'}`}>
                        {/* 请求信息 */}
                        <div className="mt-2">
                            <span className="text-gray-500 dark:text-gray-600 inline-block w-20">Path:</span>
                            <span className="text-gray-700 dark:text-gray-450 break-all">
                                {debugInfo.pathname}
                            </span>
                        </div>
                        
                        {debugInfo.search && (
                            <div>
                                <span className="text-gray-500 dark:text-gray-600 inline-block w-20">Query:</span>
                                <span className="text-gray-700 dark:text-gray-450 break-all">
                                    {debugInfo.search}
                                </span>
                            </div>
                        )}

                        {/* 系统信息 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                            <div>
                                <span className="text-gray-500 dark:text-gray-600 inline-block w-20">OS:</span>
                                <span className="text-gray-700 dark:text-gray-450">
                                    {`${debugInfo.system.os} ${debugInfo.system.version}`}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-600 inline-block w-20">Browser:</span>
                                <span className="text-gray-700 dark:text-gray-450">
                                    {`${debugInfo.system.browser} ${debugInfo.system.browserVersion}`}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-600 inline-block w-20">Screen:</span>
                                <span className="text-gray-700 dark:text-gray-450">
                                    {debugInfo.screenSize}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-600 inline-block w-20">Memory:</span>
                                <span className="text-gray-700 dark:text-gray-450">
                                    {debugInfo.system.memory.total}
                                </span>
                            </div>
                        </div>

                        {/* 其他信息 */}
                        <div className="mt-4 space-y-2">
                            <div>
                                <span className="text-gray-400 dark:text-gray-500 inline-block w-20">Language:</span>
                                <span className="text-gray-600 dark:text-gray-300">{debugInfo.language}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 dark:text-gray-500 inline-block w-20">Build:</span>
                                <span className="text-gray-600 dark:text-gray-300 font-semibold">
                                    {debugInfo.buildVersion}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 dark:text-gray-500 inline-block w-20">IP:</span>
                                <ClientOnly>
                                    <span className="text-gray-600 dark:text-gray-300 font-mono">
                                        {debugInfo.ip || 'Loading...'}
                                    </span>
                                </ClientOnly>
                            </div>
                        </div>

                        {/* 错误堆栈 */}
                        {debugInfo.stack && (
                            <details className="mt-4">
                                <summary className="text-gray-400 dark:text-gray-500 cursor-pointer 
                                                 hover:text-gray-600 dark:hover:text-gray-400 
                                                 transition-colors">
                                    Stack Trace
                                </summary>
                                <pre className="max-h-[200px] overflow-y-auto mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded 
                                              border border-gray-100 dark:border-gray-800 
                                              overflow-x-auto text-[10px] leading-4">
                                    <code className="text-gray-600 dark:text-gray-300">
                                        {debugInfo.stack}
                                    </code>
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function ClientOnly({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return <>{children}</>;
}