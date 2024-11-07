import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface ThoughtStreamProps {
    duration: number;
    content: string;
    isAnimating: boolean;
}

export const ThoughtStream: React.FC<ThoughtStreamProps> = ({
    duration,
    content,
    isAnimating
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTitle, setCurrentTitle] = useState<string>('Thinking');

    // 使用 useMemo 提取标题，避免重复计算
    const extractedTitle = useMemo(() => {
        // 使用正则表达式匹配 "> **文本**" 格式的最后一个标题
        const titleRegex = />\s*\*\*(.*?)\*\*/g;
        let lastTitle = '';
        let match;

        // 使用正则的 exec 方法逐个匹配，找到最后一个标题
        while ((match = titleRegex.exec(content)) !== null) {
            lastTitle = match[1];
        }

        return lastTitle || 'Thinking';
    }, [content]);

    // 使用 useEffect 更新标题
    useEffect(() => {
        if (extractedTitle && extractedTitle !== currentTitle) {
            setCurrentTitle(extractedTitle);
        }
    }, [extractedTitle, currentTitle]);

    return (
        <div>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full group flex items-center gap-2 text-gray-650 dark:text-gray-300 hover:dark:text-gray-750 hover:text-gray-800 h-8 my-1.5 relative transition-colors"
            >
                <div className="flex items-center gap-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={currentTitle}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "relative",
                                isAnimating && "shine-effect"
                            )}
                        >
                            {isAnimating ? currentTitle : `Thought for ${duration} seconds`}
                        </motion.span>
                    </AnimatePresence>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                    ) : (
                        <ChevronDown className="w-5 h-5" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="overflow-hidden transition-all">
                    <div className="mb-2">
                        <MarkdownRenderer content={content} />
                    </div>
                </div>
            )}
        </div>
    );
}; 