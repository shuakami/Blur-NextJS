import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import hljs from 'highlight.js';
import { throttle } from 'lodash';
import { Check, Copy, Terminal } from 'lucide-react';
import '../../../../styles/code/luoxiaohei.css';

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
        throttle((code: string) => {
            if (!isInlineCode && code.trim().length > 0) {
                try {
                    const highlighted = hljs.highlight(code, {
                        language: language || 'plaintext',
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
        <div className="relative group rounded-lg overflow-hidden bg-gray-50/50 dark:bg-gray-800/30 
                      border border-gray-150/50 dark:border-gray-900/15 backdrop-blur-sm">
            {/* 头部工具栏 */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
                {/* 语言标识 */}
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium 
                             text-gray-500 dark:text-gray-400 select-none">
                    <Terminal size={14} />
                    {language}
                </div>

                {/* 复制按钮 */}
                <CopyToClipboard text={code} onCopy={handleCopy}>
                    <button 
                        className=" p-1.5 rounded-md text-gray-400 hover:text-gray-600
                                 dark:text-gray-500 dark:hover:text-gray-300
                                 hover:bg-gray-100 dark:hover:bg-gray-700/50
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
            <pre className="!mt-0 pt-4 pb-4 px-4 overflow-x-auto">
                <code 
                    ref={codeRef}
                    className={`language-${language} text-sm`}
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
            </pre>

            {/* 边框 */}
            <div className="absolute inset-0 pointer-events-none border border-gray-200/40 dark:border-gray-900 rounded-lg" />
        </div>
    );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;