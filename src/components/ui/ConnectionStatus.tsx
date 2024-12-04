// ConnectionStatus.tsx

import { memo, useState, useRef } from 'react';
import { useConnection } from '../../hooks/api/useConnection';
import { cn } from '../../lib/utils/utils';
import { useOnClickOutside } from '../../hooks/ui/useOnClickOutside';
import useTranslation from '../../hooks/i18n/useTranslation';
import Link from 'next/link';

const ConnectionStatus = memo(() => {
    const { 
        status, 
        clientLatency,
        region,
        serverStatus
    } = useConnection();
    
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showDetails, setShowDetails] = useState(false);

    useOnClickOutside(containerRef, () => setIsOpen(false));

    // 获取延迟等级
    const getLatencyLevel = (ms: number): 'good' | 'medium' | 'poor' => {
        if (ms <= 1500) return 'good';   
        if (ms <= 3000) return 'medium';  
        return 'poor';                   
    };

    // 获取资源使用等级
    const getUsageLevel = (value: number): 'good' | 'warning' | 'critical' => {
        if (value < 0.7) return 'good';
        if (value < 0.9) return 'warning';
        return 'critical';
    };

    const statusConfig: Record<string, { 
        dotColor: string; 
        text: string; 
        description: string;
        icon?: string;  // 可以添加图标
    }> = {
        connected: {
            dotColor: 'bg-green-500',
            text: t('已连接'),
            description: t('连接正常')
        },
        connecting: {  // 添加连接中状态
            dotColor: 'bg-yellow-500',
            text: t('连接中'),
            description: t('正在连接到服务器')
        },
        server_down: {
            dotColor: 'bg-red-500',
            text: t('服务器错误'),
            description: t('服务器暂时无法访问，请稍后再试')
        },
        disconnected: {
            dotColor: 'bg-red-500',
            text: t('连接失败'),
            description: t('请检查网络连接')
        }
    };

    const getDisplayStatus = (): keyof typeof statusConfig => {
        if (status === 'connected') return 'connected';
        if (status === 'connecting') return 'connecting';
        if (status === 'server_down') return 'server_down';
        return 'disconnected';
    };

    const displayStatus = getDisplayStatus();
    const config = statusConfig[displayStatus];
    const clientLatencyLevel = getLatencyLevel(clientLatency);

    return (
        <div className="fixed bottom-4 right-4 z-50" ref={containerRef}>
            {/* 状态指示器 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2.5",
                    "h-7 px-2.5",
                    "rounded-full",
                    "transition-all duration-300",
                    "bg-white/95 dark:bg-gray-800/95",
                    "border border-gray-200/50 dark:border-gray-700/50",
                )}
            >
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    config.dotColor,
                )} />
                <span className={cn(
                    "text-xs font-medium",
                    displayStatus === 'connected' ? "text-gray-600 dark:text-gray-300" : 
                    displayStatus === 'connecting' ? "text-yellow-600 dark:text-yellow-400" :
                    "text-red-600 dark:text-red-400"
                )}>
                    {config.text}
                </span>
            </button>

            {/* 详细信息面板 */}
            {isOpen && (
                <div className={cn(
                    "absolute bottom-full mb-2 right-0",
                    "w-72 rounded-xl",
                    "bg-white/95 dark:bg-gray-800/95",
                    "shadow-lg",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "divide-y divide-gray-100/50 dark:divide-gray-700/50",
                    "overflow-hidden"
                )}>
                    {/* 状态概览 */}
                    <div className="px-4 py-3.5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    config.dotColor,
                                )} />
                                <span className="text-sm font-medium">{config.text}</span>
                            </div>
                            {displayStatus === 'connected' && region && (
                                <span className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
                                    {region}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">{config.description}</p>
                    </div>

                    {/* 连接正常时显示状态指标 */}
                    {displayStatus === 'connected' && (
                        <>
                            <div className="px-4 py-3.5 space-y-3">
                                {/* 网络状态 */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{t('网络延迟')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-xs tabular-nums font-medium",
                                            clientLatencyLevel === 'good' ? "text-green-500" :
                                            clientLatencyLevel === 'medium' ? "text-yellow-500" :
                                            "text-red-500"
                                        )}>
                                            {clientLatency}ms
                                        </span>
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            clientLatencyLevel === 'good' ? "bg-green-500" :
                                            clientLatencyLevel === 'medium' ? "bg-yellow-500" :
                                            "bg-red-500"
                                        )} />
                                    </div>
                                </div>

                                {/* 服务器状态 */}
                                {serverStatus && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">{t('服务器状态')}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-xs font-medium",
                                                getUsageLevel(Math.max(serverStatus.load, serverStatus.memory)) === 'good' ? "text-green-500" :
                                                getUsageLevel(Math.max(serverStatus.load, serverStatus.memory)) === 'warning' ? "text-yellow-500" :
                                                "text-red-500"
                                            )}>
                                                {getUsageLevel(Math.max(serverStatus.load, serverStatus.memory)) === 'good' ? t('正常') :
                                                 getUsageLevel(Math.max(serverStatus.load, serverStatus.memory)) === 'warning' ? t('繁忙') :
                                                 t('过载')}
                                            </span>
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                getUsageLevel(Math.max(serverStatus.load, serverStatus.memory)) === 'good' ? "bg-green-500" :
                                                getUsageLevel(Math.max(serverStatus.load, serverStatus.memory)) === 'warning' ? "bg-yellow-500" :
                                                "bg-red-500"
                                            )} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 详情按钮和详细信息 */}
                            {serverStatus && (
                                <>
                                    <button 
                                        onClick={() => setShowDetails(!showDetails)}
                                        className={cn(
                                            "w-full px-4 py-2.5",
                                            "text-xs text-gray-500",
                                            "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                                            "transition-colors"
                                        )}
                                    >
                                        {showDetails ? t('收起服务器状态') : t('查看服务器状态')}
                                    </button>

                                    {showDetails && (
                                        <div className="px-4 py-3.5 space-y-3 bg-gray-50/50 dark:bg-gray-700/10">
                                            {/* CPU 使用率 */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">CPU</span>
                                                    <span className="text-xs font-medium tabular-nums">
                                                        {Math.round(serverStatus.load * 100)}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-gray-200/50 dark:bg-gray-600/50 rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn(
                                                            "h-full transition-all duration-300",
                                                            getUsageLevel(serverStatus.load) === 'good' ? "bg-green-500" :
                                                            getUsageLevel(serverStatus.load) === 'warning' ? "bg-yellow-500" :
                                                            "bg-red-500"
                                                        )}
                                                        style={{ width: `${serverStatus.load * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* 内存使用率 */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">{t('内存')}</span>
                                                    <span className="text-xs font-medium tabular-nums">
                                                        {Math.round(serverStatus.memory * 100)}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-gray-200/50 dark:bg-gray-600/50 rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn(
                                                            "h-full transition-all duration-300",
                                                            getUsageLevel(serverStatus.memory) === 'good' ? "bg-green-500" :
                                                            getUsageLevel(serverStatus.memory) === 'warning' ? "bg-yellow-500" :
                                                            "bg-red-500"
                                                        )}
                                                        style={{ width: `${serverStatus.memory * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* 非连接状态显示重试按钮 */}
                    {displayStatus !== 'connected' && displayStatus !== 'connecting' && (
                        <div className="p-4">
                            <p className="text-xs text-gray-500 text-center">
                                {displayStatus === 'server_down' ? 
                                    t('服务器可能正在维护或遇到临时问题') : 
                                    t('请确保设备已连接到互联网')}
                                {' '}
                                <Link href="https://status.luoxiaohei.cn" target="_blank" className="text-blue-500">
                                    {t('前往状态系统')}
                                </Link>
                            </p>
                        </div>
                    )}

                    {/* 连接中状态显示加载动画 */}
                    {displayStatus === 'connecting' && (
                        <div className="px-4 py-3 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

ConnectionStatus.displayName = 'ConnectionStatus';

export default ConnectionStatus;
