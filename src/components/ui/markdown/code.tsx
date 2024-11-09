import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import hljs from 'highlight.js';
import { throttle } from 'lodash';
import { Check, Copy, Terminal } from 'lucide-react';
import LANGUAGE_ALIASES from './languageAliases';
import '../../../../styles/code/luoxiaohei.css';

// 已加载的语言缓存
const loadedLanguages = new Set(['plaintext']);

// 动态导入语言
async function loadLanguage(language: string): Promise<void> {
    if (loadedLanguages.has(language)) return;
    
    try {
        const normalizedLang = LANGUAGE_ALIASES[language] || language;
        
        if (normalizedLang === 'batch') {
            // 动态导入自定义 batch 语言配置
            const { default: batchLanguage } = await import('./Languages/batchLanguage');
            hljs.registerLanguage('batch', batchLanguage);
        } else if (normalizedLang === 'tsx') {
            // 动态导入自定义 tsx 语言配置
            const { default: tsxLanguage } = await import('./Languages/tsxLanguage');
            hljs.registerLanguage('tsx', tsxLanguage);
        } else {
            // 使用 highlight.js 的新导入方式
            const languageModule = await import('highlight.js/lib/languages/' + normalizedLang);
            hljs.registerLanguage(normalizedLang, languageModule.default);
        }
        
        loadedLanguages.add(language);
        loadedLanguages.add(normalizedLang);
    } catch (error) {
        console.warn(`Failed to load language ${language}:`, error);
    }
}

interface CodeBlockProps {
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = memo(({ code, language = 'plaintext' }) => {
    const [copied, setCopied] = useState(false);
    const [highlightedCode, setHighlightedCode] = useState(code);
    const codeRef = useRef<HTMLElement>(null);
    const isInlineCode = !code.includes('\n');
    
    // 使用节流的高亮函数
    const highlightCode = useCallback(
        throttle(async (code: string) => {
            if (!isInlineCode && code.trim().length > 0) {
                try {
                    const normalizedLang = LANGUAGE_ALIASES[language] || language;
                    await loadLanguage(normalizedLang);
                    
                    const highlighted = hljs.highlight(code, {
                        language: normalizedLang,
                        ignoreIllegals: true
                    }).value;
                    setHighlightedCode(highlighted);
                } catch (error) {
                    console.error('Highlight failed:', error);
                    setHighlightedCode(code);
                }
            }
        }, 200),
        [language, isInlineCode]
    );

    useEffect(() => {
        highlightCode(code);
    }, [code, highlightCode]);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isInlineCode) {
        return <code className="inline-code">{code}</code>;
    }

    return (
        <div className="mb-3 relative group rounded-lg overflow-hidden bg-gray-50/45 dark:bg-gray-945
                      border border-gray-50 dark:border-gray-900/50">
            {/* 头部工具栏 */}
            <div className="z-30 absolute top-3 right-3 flex items-center gap-1">
                {/* 语言标识 */}
                <div className="flex items-center gap-1 px-2 py-1 text-xs font-light bg-gray-50/45 dark:bg-gray-945
                             text-gray-450 hover:text-gray-600 dark:text-gray-500
                              dark:hover:text-gray-300 select-none hover:bg-gray-80 dark:hover:bg-gray-940
                              transition-colors duration-200 rounded-md">
                    <Terminal size={14} />
                    {language}
                </div>

                {/* 复制按钮 */}
                <CopyToClipboard text={code} onCopy={handleCopy}>
                    <button 
                        className="p-1.5 rounded-md text-gray-400 bg-[#FCFCFC] dark:bg-gray-945 hover:text-gray-600
                                 dark:text-gray-500 dark:hover:text-gray-300
                                 hover:bg-gray-80 dark:hover:bg-gray-940
                                 transition-colors duration-200"
                        title="复制代码"
                    >
                        {copied ? (
                            <Check size={16} className="text-gray-650 dark:text-gray-350" />
                        ) : (
                            <Copy size={16} />
                        )}
                    </button>
                </CopyToClipboard>
            </div>

            {/* 代码内容 */}
            <div className="overflow-auto">
                <pre className="!mt-0 pt-2.5 pb-3 px-4 min-w-full">
                    <code 
                        ref={codeRef}
                        className={`language-${language} hljs`}
                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                </pre>
            </div>

            {/* 边框 */}
            <div className="absolute inset-0 pointer-events-none border border-gray-200/40 dark:border-gray-900 rounded-lg" />
        </div>
    );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;