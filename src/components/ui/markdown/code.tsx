import React, { useState, useRef, useLayoutEffect, memo } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { CSSTransition } from 'react-transition-group';

interface CodeBlockProps {
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = memo(({ code, language = 'plaintext' }) => {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        if (codeRef.current) {
            hljs.highlightElement(codeRef.current);
        }
    }, [code, language]);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isInlineCode = !code.includes('\n');
    const ContainerElement = isInlineCode ? 'span' : 'div';

    return (
        <ContainerElement
            className={`code-block-wrapper ${isInlineCode ? 'inline-code' : ''}`}
        >
            {/* 语言标签，不随滚动 */}
            {!isInlineCode && (
                <div
                    className="text-[0.75rem]"
                    style={{
                        position: 'absolute',
                        top: '10px',
                        left: '13px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        zIndex: 1,
                    }}
                >
                    <span>{language}</span> {/* 显示语言名称，非大写 */}
                </div>
            )}

            {/* 复制按钮，随滚动 */}
            {!isInlineCode && (
                <div className="sticky top-2 cursor-pointer z-50">
                    <div
                        className="label-button-container"
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '13px',
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <CopyToClipboard text={code} onCopy={handleCopy}>
                            <CSSTransition in={copied} timeout={300} classNames="fade">
                                <button>
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </CSSTransition>
                        </CopyToClipboard>
                    </div>
                </div>
            )}

            {isInlineCode ? (
                <code ref={codeRef} className={`language-${language}`}>{code}</code>
            ) : (
                <pre className="code-block">
                    <code ref={codeRef} className={`mt-5 language-${language}`}>{code}</code>
                </pre>
            )}
        </ContainerElement>
    );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
