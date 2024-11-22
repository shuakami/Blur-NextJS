// ConnectionStatus.tsx

import { memo, useState, useRef } from 'react';
import { useConnection } from '@/hooks/useConnection';
import { cn } from '@/lib/utils';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import useTranslation from '@/hooks/useTranslation';

const ConnectionStatus = memo(() => {
    const { 
        status, 
        clientLatency,
        serverLatency,
        region,
        serverStatus,
        isHealthy
    } = useConnection();
    
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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

    const statusConfig: Record<string, { dotColor: string; text: string; description: string }> = {
        connected: {
            dotColor: 'bg-green-500',
            text: t('已连接'),
            description: t('连接正常')
        },
        server_down: {
            dotColor: 'bg-red-500',
            text: t('连接超时'),
            description: t('服务器可能暂时无法访问')
        },
        disconnected: {
            dotColor: 'bg-red-500',
            text: t('连接失败'),
            description: t('似乎无法连接到服务器')
        }
    };

    const getDisplayStatus = (): keyof typeof statusConfig => {
        if (status === 'connected') return 'connected';
        if (serverStatus?.is_degraded) return 'server_down';
        if (status === 'disconnected') return 'disconnected';
        return 'disconnected'; // 默认值
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
                    "flex items-center gap-2",
                    "h-8 px-3",
                    "rounded-full",
                    "transition-all duration-300",
                    "border border-gray-200/50 dark:border-gray-700/50"
                )}
            >
                {/* 状态点 */}
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    config.dotColor
                )} />
                
                {/* 状态文本 */}
                <span className={cn(
                    "text-xs",
                    displayStatus === 'connected' ? "text-gray-600 dark:text-gray-300" : "text-red-600 dark:text-red-300"
                )}>
                    {config.text}
                </span>
            </button>

            {/* 详细信息面板 */}
            {isOpen && (
                <div className={cn(
                    "absolute bottom-full mb-2 right-0",
                    "w-80 rounded-lg",
                    "bg-white/95 dark:bg-gray-900/95",
                    "backdrop-blur-sm",
                    "shadow-lg",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "p-4 space-y-4"
                )}>
                    {/* 连接状态概览 */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    config.dotColor
                                )} />
                                <span className="text-sm font-medium">
                                    {config.text}
                                </span>
                            </div>
                            {region && (
                                <span className="text-xs text-gray-500">
                                    {region}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            {config.description}
                        </p>
                    </div>

                    {/* 只在有网络连接时显示详细信息 */}
                    {['connected', 'server_down'].includes(displayStatus) && (
                        <>
                            {/* 延迟指标 */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-medium">{t('连接质量')}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* 网络延迟 */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">{t('网络延迟')}</span>
                                            <span className={cn(
                                                clientLatencyLevel === 'good' ? "text-gray-500" :
                                                clientLatencyLevel === 'medium' ? "text-yellow-500" :
                                                "text-red-500"
                                            )}>
                                                {clientLatency}ms
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                            <div 
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-300",
                                                    clientLatencyLevel === 'good' ? "bg-green-500" :
                                                    clientLatencyLevel === 'medium' ? "bg-yellow-500" :
                                                    "bg-red-500"
                                                )}
                                                style={{ width: `${Math.min(clientLatency / 5, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* 服务器延迟 */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">{t('处理延迟')}</span>
                                            <span className="text-gray-500">
                                                {serverLatency}ms
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                            <div 
                                                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                                style={{ width: `${Math.min(serverLatency / 5, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 服务器状态 */}
                            {serverStatus && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-medium">{t('服务器状态')}</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* CPU 使用率 */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">CPU</span>
                                                <span className={cn(
                                                    getUsageLevel(serverStatus.load) === 'good' ? "text-gray-500" :
                                                    getUsageLevel(serverStatus.load) === 'warning' ? "text-yellow-500" :
                                                    "text-red-500"
                                                )}>
                                                    {Math.round(serverStatus.load * 100)}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                                <div 
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-300",
                                                        getUsageLevel(serverStatus.load) === 'good' ? "bg-green-500" :
                                                        getUsageLevel(serverStatus.load) === 'warning' ? "bg-yellow-500" :
                                                        "bg-red-500"
                                                    )}
                                                    style={{ width: `${serverStatus.load * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* 内存使用率 */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">{t('内存')}</span>
                                                <span className={cn(
                                                    getUsageLevel(serverStatus.memory) === 'good' ? "text-gray-500" :
                                                    getUsageLevel(serverStatus.memory) === 'warning' ? "text-yellow-500" :
                                                    "text-red-500"
                                                )}>
                                                    {Math.round(serverStatus.memory * 100)}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                                <div 
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-300",
                                                        getUsageLevel(serverStatus.memory) === 'good' ? "bg-green-500" :
                                                        getUsageLevel(serverStatus.memory) === 'warning' ? "bg-yellow-500" :
                                                        "bg-red-500"
                                                    )}
                                                    style={{ width: `${serverStatus.memory * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
});

ConnectionStatus.displayName = 'ConnectionStatus';

export default ConnectionStatus;
