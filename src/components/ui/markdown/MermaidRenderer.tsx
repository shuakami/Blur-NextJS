"use client";

import React, { useEffect, useRef, memo, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import LoadingDots from '../loading-dots';
import { ClipboardIcon, CheckIcon, DownloadIcon, ImageIcon, FileCode } from 'lucide-react';
import { ColorScheme, getThemeVariables} from './mermaid-themes';
import { exportDiagram } from './mermaid-export';
import { useChatContext } from "@/app/[上下文]/ChatContext";


interface MermaidRendererProps {
    chart: string;
    className?: string;
}

// 预处理图表内容，强制添加换行和大小限制
const preprocessChart = (chartContent: string): string => {
    // 检测图表类型
    const isFlowchart = chartContent.trim().startsWith('graph') || chartContent.trim().startsWith('flowchart');
    const isSequence = chartContent.trim().startsWith('sequenceDiagram');
    const isGantt = chartContent.trim().startsWith('gantt');

    if (isFlowchart) {
        // 为流程图添加方向和大小限制
        return chartContent.replace(
            /^(graph|flowchart)\s+(TD|LR|RL|BT)/,
            '$1 TD\n    %% 强制自适应大小\n    %%{init: {"flowchart": {"nodeSpacing": 30, "rankSpacing": 30, "width": "100%", "height": "auto"}} }%%'
        );
    }

    if (isSequence) {
        // 为时序图添加自动换行
        return `%%{init: {"sequence": {"width": 300, "actorMargin": 30, "messageMargin": 20, "wrap": true}} }%%\n${chartContent}`;
    }

    if (isGantt) {
        // 为甘特图添加宽度限制
        return `%%{init: {"gantt": {"width": "100%", "leftPadding": 40}} }%%\n${chartContent}`;
    }

    return chartContent;
};

// 浅色主题
export const lightThemeVariables = {
    // 基础颜色
    background: '#ffffff',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontSize: '13px',
    
    // 主要颜色
    primaryColor: '#ffffff',
    primaryTextColor: '#2c2c2c',
    primaryBorderColor: '#d4d4d4',
    secondaryColor: '#f9fafb',
    tertiaryColor: '#f3f4f6',
    
    // 文本颜色
    textColor: '#374151',
    titleColor: '#111827',
    
    // 线条颜色
    lineColor: '#e5e7eb',
    
    // 注释样式
    noteBkgColor: '#fff8e6',
    noteTextColor: '#664d03',
    noteBorderColor: '#fde68a',
    
    // 错误样式
    errorBkgColor: '#fef2f2',
    errorTextColor: '#991b1b',
    
    // 流程图特定样式
    nodeBkg: '#ffffff',
    nodeBorder: '#d1d5db',
    clusterBkg: '#f9fafb',
    clusterBorder: '#e5e7eb',
    defaultLinkColor: '#9ca3af',
    edgeLabelBackground: '#ffffff',
    
    // 时序图特定样式
    actorBorder: '#d1d5db',
    actorBkg: '#ffffff',
    actorTextColor: '#374151',
    actorLineColor: '#d1d5db',
    signalColor: '#4b5563',
    signalTextColor: '#374151',
    labelBoxBkgColor: '#ffffff',
    labelBoxBorderColor: '#d1d5db',
    labelTextColor: '#374151',
    loopTextColor: '#374151',
    activationBorderColor: '#e5e7eb',
    activationBkgColor: '#f9fafb',
    sequenceNumberColor: '#9ca3af'
};

// 深色主题
export const darkThemeVariables = {
    // 基础颜色
    background: '#18181b',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontSize: '13px',
    
    // 主要颜色
    primaryColor: '#27272a',
    primaryTextColor: '#e4e4e7',
    primaryBorderColor: '#3f3f46',
    secondaryColor: '#27272a',
    tertiaryColor: '#3f3f46',
    
    // 文本颜色
    textColor: '#d4d4d8',
    titleColor: '#fafafa',
    
    // 线条颜色
    lineColor: '#52525b',
    
    // 注释样式
    noteBkgColor: '#292524',
    noteTextColor: '#fde68a',
    noteBorderColor: '#78350f',
    
    // 错误样式
    errorBkgColor: '#7f1d1d',
    errorTextColor: '#fecaca',
    
    // 流程图特定样式
    nodeBkg: '#27272a',
    nodeBorder: '#52525b',
    clusterBkg: '#27272a',
    clusterBorder: '#3f3f46',
    defaultLinkColor: '#71717a',
    edgeLabelBackground: '#27272a',
    
    // 时序图特定样式
    actorBorder: '#52525b',
    actorBkg: '#27272a',
    actorTextColor: '#e4e4e7',
    actorLineColor: '#52525b',
    signalColor: '#d4d4d8',
    signalTextColor: '#e4e4e7',
    labelBoxBkgColor: '#27272a',
    labelBoxBorderColor: '#52525b',
    labelTextColor: '#e4e4e7',
    loopTextColor: '#e4e4e7',
    activationBorderColor: '#3f3f46',
    activationBkgColor: '#27272a',
    sequenceNumberColor: '#71717a'
};

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose' as const,
    fontSize: 13,
    
    themeVariables: {
        // 基础颜色
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        primaryColor: '#ffffff',
        primaryTextColor: '#334155',
        primaryBorderColor: '#94a3b8',  // 更深的边框色
        secondaryColor: '#f8fafc',
        tertiaryColor: '#f1f5f9',
        
        // 线条和文本
        lineColor: '#94a3b8',  // 更深的线条色
        textColor: '#334155',
        
        // 节点样式
        nodeBorder: '#94a3b8',
        nodeTextColor: '#334155',
        
        // 子图样式
        clusterBkg: '#ffffff',
        clusterBorder: '#94a3b8',
        
        // 连接线样式
        defaultLinkColor: '#94a3b8',
        edgeLabelBackground: '#ffffff',
        
        // 标题和标签
        titleColor: '#1e293b',
        labelTextColor: '#475569',
        
        // 注释样式
        noteBkgColor: '#fff5ad',
        noteTextColor: '#334155',
        noteBorderColor: '#fde68a',
        
        // 活动状态
        activationBorderColor: '#3b82f6',
        activationBkgColor: '#f1f5f9',
        
        // 时序图特定样式
        actorBorder: '#94a3b8',
        actorBkg: '#ffffff',
        actorTextColor: '#334155',
        actorLineColor: '#94a3b8',
        signalColor: '#94a3b8',
        signalTextColor: '#334155',
        
        // 暗色模式
        darkMode: false
    },
    
    flowchart: {
        htmlLabels: true,
        curve: 'basis',
        useMaxWidth: true,
        rankSpacing: 36,
        nodeSpacing: 30,
        padding: 12,
        defaultRenderer: 'dagre-wrapper'
    },

    sequence: {
        useMaxWidth: true,
        width: 300,
        height: 400,
        actorMargin: 50,
        boxMargin: 10,
        mirrorActors: false,
        bottomMarginAdj: 10,
        messageMargin: 35,
        wrap: true,
        wrapPadding: 10,
        boxTextMargin: 8,
        noteMargin: 10
    },

    gantt: {
        useMaxWidth: true,
        leftPadding: 40,
        rightPadding: 20,
        topPadding: 30,
        fontSize: 11,
        titleTopMargin: 25,
        barHeight: 35,
        barGap: 8,
        gridLineStartPadding: 35,
        axisFormat: '%m-%d',
        topAxis: false,
        displayMode: 'compact'
    }
});

// 图表语法验证和清理
const sanitizeChart = (chartContent: string): string => {
    try {
        // 移除可能的 markdown 代码块标记
        let cleanChart = chartContent
            .replace(/^```mermaid\n/, '')
            .replace(/```$/, '')
            .trim();

        // 确保每行结尾只有一个换行符
        cleanChart = cleanChart.split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .join('\n');

        // 检查并修复常见语法问题
        if (cleanChart.includes('sequenceDiagram')) {
            // 确保参与者定义和消息格式正确
            cleanChart = cleanChart.split('\n').map(line => {
                // 修复参与者定义
                if (line.includes('参与者') || line.includes('participant')) {
                    return line.replace(/参与者\s+(\w+)\s+as\s+(.+)/, 'participant $1 as "$2"');
                }
                // 确保消息箭头格式正确
                if (line.includes('->') && !line.includes('->>')) {
                    return line.replace(/->/g, '->>')
                }
                return line;
            }).join('\n');
        }

        if (cleanChart.includes('gantt')) {
            // 确保甘特图格式正确
            cleanChart = cleanChart.split('\n').map(line => {
                // 修复日期格式
                if (line.includes('dateFormat')) {
                    return 'dateFormat YYYY-MM-DD';
                }
                // 确保任务定义格式正确
                if (line.match(/\d{4}-\d{2}-\d{2}/)) {
                    const parts = line.split(':').map(p => p.trim());
                    if (parts.length === 2) {
                        const [task, date] = parts;
                        return `${task} :${date}`;
                    }
                }
                return line;
            }).join('\n');
        }

        return cleanChart;
    } catch (err) {
        console.warn('Chart sanitization warning:', err);
        return chartContent; // 如果清理失败，返回原始内容
    }
};

export const MermaidRenderer = memo<MermaidRendererProps>(({ chart, className = '' }) => {
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [copied, setCopied] = React.useState(false);
    const svgRef = useRef<SVGElement | null>(null);
    const [showExportMenu, setShowExportMenu] = React.useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme>('system');
    const { isStreaming } = useChatContext();

    // 更新渲染函数
    const renderChart = async () => {
        if (!containerRef.current) return;

        try {
            setLoading(true);
            setError(null);

            const cleanChart = sanitizeChart(chart);
            const processedChart = preprocessChart(cleanChart);

            try {
                await mermaid.parse(processedChart);
            } catch (parseError) {
                throw new Error(`图表语法有误，请检查语法是否正确: ${String(parseError)}`);
            }

            // 使用选择的配色方案
            mermaid.initialize({
                theme: 'base',
                themeVariables: getThemeVariables(selectedColorScheme, theme || 'system', lightThemeVariables, darkThemeVariables),
            });

            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
            const { svg } = await mermaid.render(id, processedChart);
            
            if (containerRef.current) {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = `
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 16px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                `;
                wrapper.innerHTML = svg;

                // 添加圆角到 SVG 元素
                const svgElement = wrapper.querySelector('svg');
                if (svgElement) {
                    // 保存 SVG 引用
                    svgRef.current = svgElement as SVGElement;

                    // 为所有矩形添加圆角
                    svgElement.querySelectorAll('rect').forEach(rect => {
                        rect.setAttribute('rx', '6');
                        rect.setAttribute('ry', '6');
                    });
                    svgElement.querySelectorAll('polygon').forEach(polygon => {
                        const points = polygon.getAttribute('points');
                        if (points) {
                            polygon.setAttribute('rx', '6');
                            polygon.setAttribute('ry', '6');
                        }
                    });
                }

                containerRef.current.innerHTML = '';
                containerRef.current.appendChild(wrapper);
            }
        } catch (err) {
            console.error('Mermaid rendering error:', err);
            setError(`图表渲染失败，请检查语法是否正确: ${String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    // 监听主题变化
    useEffect(() => {
        renderChart();
    }, [chart, theme, selectedColorScheme]); // 添加 selectedColorScheme 作为依赖

    // 主题切换处理函数
    const handleThemeChange = (newTheme: ColorScheme) => {
        setSelectedColorScheme(newTheme);
        setShowExportMenu(false); // 可选：切换后关闭菜单
    };

    // 复制功能
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(chart);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // 点击外部关闭导出菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative my-6 group">
            <div 
                className={`
                    w-full mx-auto overflow-hidden
                    bg-white dark:bg-zinc-800/95
                    border border-gray-200/80 dark:border-white/[0.15]
                    rounded-md ${loading ? 'min-h-[120px]' : ''}
                    ${className}
                `}
            >
                {/* 工具栏 */}
                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/80 border border-gray-200/50 dark:border-white/[0.1] transition-colors"
                        title="复制代码"
                    >
                        <div className="relative w-4 h-4">
                            <ClipboardIcon className={`w-4 h-4 absolute transition-opacity ${copied ? 'opacity-0' : 'opacity-100'}`} />
                            <CheckIcon className={`w-4 h-4 absolute text-green-500 transition-opacity ${copied ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                    </button>
                    
                    {/* 导出按钮和菜单 */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/80 border border-gray-200/50 dark:border-white/[0.1] transition-colors"
                            title="导出图表"
                        >
                            <DownloadIcon className="w-4 h-4" />
                        </button>
                        
                        {showExportMenu && (
                            <div 
                                ref={exportMenuRef}
                                className="absolute right-0 mt-1.5 w-64 max-h-[calc(100vh-100px)] overflow-y-auto bg-white dark:bg-zinc-900/95 rounded-lg shadow-lg ring-1 ring-gray-200/40 dark:ring-white/10 backdrop-blur-sm divide-y divide-gray-200/50 dark:divide-white/[0.08]"
                            >
                                {/* 配色选项 */}
                                <div className="p-2">
                                    <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                        配色方案
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <button
                                            onClick={() => handleThemeChange('light')}
                                            className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-2 ${
                                                selectedColorScheme === 'light' 
                                                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' 
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <div className="w-3 h-3 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                                            浅色
                                        </button>
                                        <button
                                            onClick={() => handleThemeChange('dark')}
                                            className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-2 ${
                                                selectedColorScheme === 'dark' 
                                                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' 
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <div className="w-3 h-3 rounded-full bg-zinc-800 ring-1 ring-zinc-700" />
                                            深色
                                        </button>
                                        <button
                                            onClick={() => handleThemeChange('spring')}
                                            className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-2 ${
                                                selectedColorScheme === 'spring' 
                                                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' 
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <div className="w-3 h-3 rounded-full bg-green-100 ring-1 ring-green-200" />
                                            薄荷绿
                                        </button>
                                        <button
                                            onClick={() => handleThemeChange('royal')}
                                            className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-2 ${
                                                selectedColorScheme === 'royal' 
                                                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' 
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <div className="w-3 h-3 rounded-full bg-purple-100 ring-1 ring-purple-200" />
                                            优雅紫
                                        </button>
                                        <button
                                            onClick={() => handleThemeChange('ocean')}
                                            className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-2 ${
                                                selectedColorScheme === 'ocean' 
                                                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' 
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <div className="w-3 h-3 rounded-full bg-blue-100 ring-1 ring-blue-200" />
                                            海洋蓝
                                        </button>
                                        <button
                                            onClick={() => handleThemeChange('system')}
                                            className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-2 ${
                                                selectedColorScheme === 'system' 
                                                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' 
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-100 to-zinc-800 ring-1 ring-gray-300" />
                                            跟随系统
                                        </button>
                                    </div>
                                </div>

                                {/* 导出选项 */}
                                <div className="p-1 z-50">
                                    <button
                                        onClick={() => exportDiagram(svgRef.current!, 'svg', selectedColorScheme, chart)}
                                        className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-white/[0.08] rounded-md flex items-center gap-2 transition-colors"
                                    >
                                        <FileCode className="w-4 h-4 opacity-70" />
                                        导出为 SVG
                                    </button>
                                    <button
                                        onClick={() => exportDiagram(svgRef.current!, 'png', selectedColorScheme, chart)}
                                        className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-white/[0.08] rounded-md flex items-center gap-2 transition-colors"
                                    >
                                        <ImageIcon className="w-4 h-4 opacity-70" />
                                        导出为 PNG
                                    </button>
                                    <button
                                        onClick={() => exportDiagram(svgRef.current!, 'json', selectedColorScheme, chart)}
                                        className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-white/[0.08] rounded-md flex items-center gap-2 transition-colors"
                                    >
                                        <FileCode className="w-4 h-4 opacity-70" />
                                        导出为 JSON
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && !isStreaming && (
                    <div className="overflow-x-auto p-4 text-sm text-red-500/90 dark:text-red-400/90 bg-red-50/50 dark:bg-red-900/20 backdrop-blur-[2px] rounded-md">
                        {error}
                    </div>
                )}
                <div ref={containerRef} />
            </div>
        </div>
    );
});

MermaidRenderer.displayName = 'MermaidRenderer';

export default MermaidRenderer