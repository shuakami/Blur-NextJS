import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import '@/components/ui/ThoughtStream.css';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { theme } = useTheme();

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

    const variants = {
        expanded: {
            height: "auto",
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
            }
        },
        collapsed: {
            height: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
            }
        }
    };

    return (
        <div>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full group flex items-center gap-2 text-gray-650 dark:text-gray-300 hover:dark:text-gray-750 hover:text-gray-800 h-8 my-1.5 relative"
            >
                <div className="flex items-center gap-1 overflow-hidden">
                    <span className={cn("relative", isAnimating && "shine-effect")} data-theme={theme}>
                        {isAnimating ? currentTitle : `Thought for ${duration} seconds`}
                    </span>
                    <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.span>
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        variants={variants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="overflow-hidden"
                    >
                        <div className="mb-2">
                            <MarkdownRenderer content={content} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}; 