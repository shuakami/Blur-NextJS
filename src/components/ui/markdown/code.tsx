import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import hljs from 'highlight.js';
import { throttle } from 'lodash';
import { Check, Copy, Loader2, Terminal } from 'lucide-react';
import LANGUAGE_ALIASES from './languageAliases';
import { loadLanguageWithRetry, preloadCommonLanguages } from './Languages/languageLoader';
import '@/styles/code/luoxiaohei.css';

// 将 hljs 设置为全局变量
declare global {
    interface Window {
        hljs: typeof hljs;
    }
}

interface CodeBlockProps {
    code: string;
    forceRenderBlock?: boolean; // 强制渲染代码块
    language?: string; // 强制指定语言
}

const CodeBlock: React.FC<CodeBlockProps> = memo(({ code, forceRenderBlock = false, language }) => {
    const [copied, setCopied] = useState(false);
    const [highlightedCode, setHighlightedCode] = useState(code);
    const [detectedLanguage, setDetectedLanguage] = useState('plaintext');
    const [isLoading, setIsLoading] = useState(false);
    const codeRef = useRef<HTMLElement>(null);
    const highlightCache = useRef(new Map());
    
    // 预加载常用语言
    useEffect(() => {
        preloadCommonLanguages();
    }, []);
    
    // 内联代码的判断逻辑
    const isInlineCode = useCallback((content: unknown) => {
        const contentStr = String(content);
        return contentStr.indexOf('\n') === -1 && contentStr.length <= 100;
    }, []);
    
    // 自动检测语言
    const detectLanguage = useCallback((content: unknown, declaredLang: string): string => {
        // 如果指定了强制语言，直接使用
        if (language) return language;
        
        const contentStr = String(content);
        if (declaredLang && declaredLang !== 'plaintext') {
            // 处理别名
            return LANGUAGE_ALIASES[declaredLang] || declaredLang;
        }

        // 快速检测常见语言特征
        if (contentStr.startsWith('import ') || contentStr.includes('export ') || contentStr.includes('interface ')) {
            return 'typescript';
        }
        if (contentStr.startsWith('def ') || contentStr.includes('import ') && contentStr.includes('from ')) {
            return 'python';
        }
        if (contentStr.startsWith('<?php')) {
            return 'php';
        }
        if (contentStr.startsWith('<template>') || contentStr.includes('export default {')) {
            return 'vue';
        }

        const detectionLanguages = [
            'javascript', 'typescript', 'python', 'java', 
            'cpp', 'c', 'css', 'html', 'xml', 'json',
            'bash', 'shell', 'yaml', 'markdown', 'tsx',
            'powershell', 'batch', 'bat', 'cmd'
        ];
        
        const result = hljs.highlightAuto(contentStr, detectionLanguages);
        
        return result.language || 'plaintext';
    }, [language]);
    
    // 高亮函数
    const highlightCode = useCallback(
        throttle(async (rawCode: string) => {
            // 检查缓存
            const cacheKey = `${rawCode}-${language}`;
            if (highlightCache.current.has(cacheKey)) {
                setHighlightedCode(highlightCache.current.get(cacheKey));
                setDetectedLanguage(language || 'plaintext');
                return;
            }

            if (!isInlineCode(rawCode) && rawCode.trim().length > 0) {
                setIsLoading(true);
                try {
                    const detectedLang = detectLanguage(rawCode, 'plaintext');
                    const normalizedLang = LANGUAGE_ALIASES[detectedLang] || detectedLang;
                    
                    await loadLanguageWithRetry(normalizedLang);
                    setDetectedLanguage(normalizedLang);
                    
                    const highlighted = hljs.highlight(rawCode, {
                        language: normalizedLang,
                        ignoreIllegals: true
                    }).value;
                    
                    setHighlightedCode(highlighted);
                    highlightCache.current.set(cacheKey, highlighted);
                } catch (error) {
                    console.error('Highlight failed:', error);
                    setHighlightedCode(rawCode);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setHighlightedCode(rawCode);
            }
        }, 200),
        [detectLanguage, isInlineCode, language]
    );

    useEffect(() => {
        highlightCode(code);
    }, [code, highlightCode]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 在组件加载时设置 hljs
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.hljs = hljs;
        }
    }, []);

    if (forceRenderBlock) {
        return (
            <pre className="text-xs leading-relaxed font-mono text-muted-foreground whitespace-pre-wrap break-words">
                <code 
                    className={`language-${language || 'javascript'} hljs`} 
                    dangerouslySetInnerHTML={{ __html: highlightedCode }} 
                />
            </pre>
        );
    }

    if (isInlineCode(code)) {
        return <code className="inline-code">{code}</code>;
    }

    return (
        <div className="mb-2.5 mt-2.5 relative group rounded-lg 
                      bg-gray-50/45 dark:bg-gray-945
                      border border-gray-200/50 dark:border-gray-800/50
                      shadow-sm dark:shadow-gray-950/50
                      backdrop-blur-sm
                      !overflow-visible">
            {/* 语言标识区域 */}
            <div className="flex items-center px-4 py-2 text-xs justify-between 
                          rounded-t-lg h-9 
                          bg-gray-100/50 dark:bg-gray-900/50
                          border-b border-gray-200/50 dark:border-gray-800/50
                          text-gray-500 dark:text-gray-400 
                          select-none">
                <div className="flex items-center gap-1.5 py-1 rounded-md
                              hover:bg-gray-200/50 dark:hover:bg-gray-800/50
                              transition-colors duration-200">
                    {isLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Terminal size={14} />
                    )}
                    <span className="font-light">{detectedLanguage}</span>
                </div>
            </div>

            {/* 复制按钮容器 */}
            <div className="sticky top-9 md:top-[3.75rem] z-10">
                <div className="absolute bottom-0 right-4 flex h-9 items-center">
                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-1 py-1 rounded-md
                                 text-xs text-gray-450 dark:text-gray-500
                                 hover:bg-gray-100/50 dark:hover:bg-gray-900/50
                                 hover:text-gray-600 dark:hover:text-gray-300
                                 transition-all duration-200
                                 font-[system-ui]"
                        title="复制代码"
                    >
                        {copied ? (
                            <>
                                <Check size={14} className="text-gray-650 dark:text-gray-350" />
                                <span>已复制</span>
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                <span>复制</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 代码内容区域 */}
            <div className="overflow-y-auto px-4 py-4">
                <pre className="!mt-0">
                    <code 
                        ref={codeRef}
                        className={`language-${detectedLanguage} hljs`}
                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                </pre>
            </div>
        </div>
    );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;