import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import hljs from 'highlight.js';
import { throttle } from 'lodash';
import { Check, Copy, Terminal } from 'lucide-react';
import LANGUAGE_ALIASES from './languageAliases';
import '../../../../styles/code/luoxiaohei.css';

const loadedLanguages = new Set(['plaintext']);

async function loadLanguage(language: string): Promise<void> {
    if (loadedLanguages.has(language)) return;
    
    try {
        const normalizedLang = LANGUAGE_ALIASES[language] || language;
        
        if (normalizedLang === 'batch') {
            const { default: batchLanguage } = await import('./Languages/batchLanguage');
            hljs.registerLanguage('batch', batchLanguage);
        } else if (normalizedLang === 'tsx') {
            const { default: tsxLanguage } = await import('./Languages/tsxLanguage');
            hljs.registerLanguage('tsx', tsxLanguage);
        } else {
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
    forceRenderBlock?: boolean; // 可选，强制要求BlockCode渲染，不渲染行间
}

const CodeBlock: React.FC<CodeBlockProps> = memo(({ code , forceRenderBlock=false }) => {

    const [copied, setCopied] = useState(false);
    const [highlightedCode, setHighlightedCode] = useState(code);
    const [detectedLanguage, setDetectedLanguage] = useState('plaintext');
    const codeRef = useRef<HTMLElement>(null);
    
    // 内联代码的判断逻辑
    const isInlineCode = useCallback((content: unknown) => {
        const contentStr = String(content);
        return !contentStr.includes('\n') && contentStr.length <= 100;
    }, []);
    
    // 自动检测语言
    const detectLanguage = useCallback((content: unknown, declaredLang: string): string => {
        const contentStr = String(content);
        if (declaredLang && declaredLang !== 'plaintext') return declaredLang;
        
        const result = hljs.highlightAuto(contentStr, [
            'javascript', 'typescript', 'python', 'java', 
            'cpp', 'c', 'css', 'html', 'xml', 'json',
            'bash', 'shell', 'yaml', 'markdown'
        ]);
        
        return result.language || 'plaintext';
    }, []);
    
    // 使用节流的高亮函数
    const highlightCode = useCallback(
        throttle(async (rawCode: string) => {
            if (!isInlineCode(rawCode) && rawCode.trim().length > 0) {
                try {
                    const detectedLang = detectLanguage(rawCode, 'plaintext');
                    const normalizedLang = LANGUAGE_ALIASES[detectedLang] || detectedLang;
                    
                    await loadLanguage(normalizedLang);
                    setDetectedLanguage(normalizedLang);
                    
                    const highlighted = hljs.highlight(rawCode, {
                        language: normalizedLang,
                        ignoreIllegals: true
                    }).value;
                    setHighlightedCode(highlighted);
                } catch (error) {
                    console.error('Highlight failed:', error);
                    setHighlightedCode(rawCode);
                }
            } else {
                setHighlightedCode(rawCode);
            }
        }, 200),
        [detectLanguage, isInlineCode]
    );

    useEffect(() => {
        highlightCode(code);
    }, [code, highlightCode]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (forceRenderBlock) {
        return <pre className="text-xs leading-relaxed font-mono text-muted-foreground whitespace-pre-wrap break-words">
            <code className={`language-javascript hljs`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>;
    }

    if (isInlineCode(code)) {
        return <code className="inline-code">{code}</code>;
    }

    return (
        <div className="mb-2.5 relative group rounded-lg overflow-hidden bg-gray-50/45 dark:bg-gray-945
                      border border-gray-50 dark:border-gray-900/50">
            <div className="z-30 absolute top-2 right-3 flex items-center gap-1">
                <div className="flex items-center gap-1 px-2 py-1 text-xs font-light bg-gray-50/45 dark:bg-gray-945
                             text-gray-450 hover:text-gray-600 dark:text-gray-500
                              dark:hover:text-gray-300 select-none hover:bg-gray-80 dark:hover:bg-gray-940
                              transition-colors duration-200 rounded-md">
                    <Terminal size={14} />
                    {detectedLanguage}
                </div>

                <button 
                    onClick={handleCopy}
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
            </div>

            <div className="overflow-auto">
                <pre className="!mt-0 pt-3 pb-3 px-4">
                    <code 
                        ref={codeRef}
                        className={`language-${detectedLanguage} hljs`}
                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                </pre>
            </div>

            <div className="absolute inset-0 pointer-events-none border border-gray-200/40 dark:border-gray-900 rounded-lg" />
        </div>
    );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;