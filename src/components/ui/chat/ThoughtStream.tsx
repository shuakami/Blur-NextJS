import React, { useState, useMemo, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';
import { cn } from '@/lib/utils/utils';
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
    const [currentTitle, setCurrentTitle] = useState<string>('Thinking...');
    const { theme } = useTheme();
    const lastTitleRef = useRef<string>('');

    // 提取所有标题
    const { titles, thoughtCount } = useMemo(() => {
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        const extractedTitles: string[] = [];
        const titleRegex = /\*\*(.*?)\*\*/g;
        let match;
        
        while ((match = titleRegex.exec(content)) !== null) {
            extractedTitles.push(match[1]);
        }

        // 如果有新标题，立即更新显示
        const lastTitle = extractedTitles[extractedTitles.length - 1];
        if (lastTitle && lastTitle !== lastTitleRef.current) {
            lastTitleRef.current = lastTitle;
            setCurrentTitle(lastTitle);
        }

        return {
            titles: extractedTitles,
            thoughtCount: lines.length
        };
    }, [content]);

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
        <div className="min-h-[32px]">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full group flex items-center gap-2 text-gray-650 dark:text-gray-300 hover:dark:text-gray-750 hover:text-gray-800 h-8 relative"
            >
                <div className="flex items-center gap-1 overflow-hidden">
                    <span 
                        className={cn("relative", isAnimating && "shine-effect")} 
                        data-theme={theme}
                    >
                        {isAnimating ? currentTitle : `${thoughtCount} thoughts generated`}
                    </span>
                    <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.span>
                </div>
            </button>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        variants={variants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="overflow-hidden"
                    >
                        <div className="blockquote">
                            <MarkdownRenderer content={content} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}; 