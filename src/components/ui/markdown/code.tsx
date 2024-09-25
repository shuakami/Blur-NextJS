import React, {useState, useEffect, useRef, useMemo} from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Prism from 'prismjs';
import {motion, AnimatePresence} from 'framer-motion';

interface CodeBlockProps {
    code: string;
    language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({code, language = 'javascript'}) => {
    const [copied, setCopied] = useState(false);
    const [hovered, setHovered] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    // 确认语言是否被 Prism 支持
    const validLanguage = useMemo(() => (Prism.languages[language] ? language : 'javascript'), [language]);

    // 使用 useMemo 缓存高亮后的代码，避免重复计算
    const highlightedCode = useMemo(() => {
        return Prism.highlight(code, Prism.languages[validLanguage], validLanguage);
    }, [code, validLanguage]);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // 复制提示2秒后消失
    };

    // 检查是否为内联代码（无换行符）还是多行代码块
    const isInlineCode = !code.includes('\n');

    // 如果是内联代码，将容器从 div 改为 span
    const ContainerElement = isInlineCode ? 'span' : 'div';

    return (
        <ContainerElement
            className={`code-block-wrapper ${isInlineCode ? 'inline-code' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{position: 'relative'}} // 为复制按钮定位做准备
        >
            {/* 只有多行代码块才显示复制按钮 */}
            {!isInlineCode && (
                <CopyToClipboard text={code} onCopy={handleCopy}>
                    <motion.div
                        className="label-button-container"
                        initial={{ opacity: 1 }}
                        animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                        transition={{
                            opacity: { delay: 0.15, duration: 0.3, ease: "easeOut" },
                        }}
                    >
                        {hovered ? (
                            <motion.div
                                role="button"
                                key="copy"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                {copied ? (
                                    <motion.span
                                        role="button"
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    >
                                        Copied!
                                    </motion.span>
                                ) : (
                                    'Copy'
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="label"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                {validLanguage.toUpperCase()}
                            </motion.div>
                        )}
                    </motion.div>
                </CopyToClipboard>
            )}

            {/* 代码块或者内联代码 */}
            {isInlineCode ? (
                <code
                    className={`language-${validLanguage}`}
                    dangerouslySetInnerHTML={{__html: highlightedCode}}
                />
            ) : (
                <pre className={`code-block language-${validLanguage}`}>
                    <code
                        className={`language-${validLanguage}`}
                        dangerouslySetInnerHTML={{__html: highlightedCode}}
                    />
                </pre>
            )}
        </ContainerElement>
    );
};
