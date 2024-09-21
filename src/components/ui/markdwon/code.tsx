import React, { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { CopyToClipboard } from 'react-copy-to-clipboard';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Prism from 'prismjs';
import { motion } from 'framer-motion';

// 代码块组件
export const CodeBlock: React.FC<{ code: string, language?: string }> = ({ code, language = 'javascript' }) => {
    const [copied, setCopied] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // 复制提示2秒后消失
    };

    const validLanguage = Prism.languages[language] ? language : 'javascript';

    return (
        <div
            className="code-block-wrapper"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <CopyToClipboard text={code} onCopy={handleCopy}>
                <motion.div
                    className="label-button-container"
                    initial={{ opacity: 1 }}
                    animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                    transition={{
                        opacity: { delay: 0.15, duration: 0.3, ease: "easeOut" }, // 动画延迟+缓动
                    }}
                >
                    {/* 判断是否悬停，显示语言标签或复制按钮 */}
                    {hovered ? (
                        <motion.div
                            key="copy"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: "easeOut" }} // 动画过渡
                        >
                            {copied ? (
                                <motion.span
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }} // 添加Copied!的动画
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
                            transition={{ duration: 0.5, ease: "easeOut" }} // 标签渐入渐出效果
                        >
                            {validLanguage.toUpperCase()}
                        </motion.div>
                    )}
                </motion.div>
            </CopyToClipboard>

            {/* 代码块 */}
            <pre className="code-block">
                <code
                    className={`language-${validLanguage}`}
                    dangerouslySetInnerHTML={{
                        __html: Prism.highlight(code, Prism.languages[validLanguage], validLanguage),
                    }}
                />
            </pre>
        </div>
    );
};
