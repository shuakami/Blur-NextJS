import React, { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { CopyToClipboard } from 'react-copy-to-clipboard';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Prism from 'prismjs';
import { motion } from 'framer-motion';

// 内联代码和代码块组件
export const CodeBlock: React.FC<{ code: string, language?: string }> = ({ code, language = 'javascript' }) => {
    const [copied, setCopied] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // 复制提示2秒后消失
    };

    const validLanguage = Prism.languages[language] ? language : 'javascript';

    // 检查是否为内联代码（无换行符）还是多行代码块
    const isInlineCode = !code.includes('\n');

    // 如果是内联代码，将容器从 div 改为 span
    const ContainerElement = isInlineCode ? 'code' : 'div';

    return (
        <ContainerElement
            className={`code-block-wrapper ${isInlineCode ? 'inline-code' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
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
                                key="copy"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                {copied ? (
                                    <motion.span
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
            <pre className={`code-block ${isInlineCode ? 'inline' : ''}`}>
                <code
                    className={`language-${validLanguage}`}
                    dangerouslySetInnerHTML={{
                        __html: Prism.highlight(code, Prism.languages[validLanguage], validLanguage),
                    }}
                />
            </pre>
        </ContainerElement>
    );
};
