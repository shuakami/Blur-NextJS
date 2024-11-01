"use client";
import React, { useMemo, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Components } from 'react-markdown';
import dynamic from 'next/dynamic';

// 懒加载较大的组件
const BlurAnimatedWrapper = dynamic(() => import("@/components/Animations/blur_text"), {
    ssr: false
});

// 静态导入基础组件
import {
    Heading1, Heading2, Heading3,
    Heading4, Heading5, Heading6
} from './headings';
import { Paragraph, Strong, Emphasis } from './text';
import { UnorderedList, OrderedList, ListItem } from './lists';
import { Link } from './link';
import { Image } from './image';
import { Blockquote } from './blockquote';
import { HorizontalRule } from './horizontalRule';
import { Table, TableHeader, TableCell } from './table';
import { TaskListItem } from './taskList';
import { Strikethrough } from './strikethrough';
import { BlockMath, InlineMath } from "@/components/ui/markdown/MathRenderer";
import CodeBlock from "@/components/ui/markdown/code";

// InlineCode 组件
const InlineCode = memo<React.PropsWithChildren<Record<string, unknown>>>(({ children }) => (
    <code className="inline-code">{children}</code>
));
InlineCode.displayName = 'InlineCode';

// 预处理
const preprocessMarkdown = (content: string): string => {
    // 使用正则表达式一次性处理所有代码块
    const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g;
    let insideCodeBlock = false;
    let processedContent = content;

    // 如果没有代码块标记，直接返回原内容
    if (!codeBlockRegex.test(content)) {
        return content;
    }

    // 处理未闭合的代码块
    const lines = processedContent.split('\n');
    const processedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith('```')) {
            insideCodeBlock = !insideCodeBlock;
        }
        processedLines.push(line);
    }

    if (insideCodeBlock) {
        processedLines.push('```');
    }

    return processedLines.join('\n');
};

// 创建 remarkPlugins 配置
const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeKatex];

export const MarkdownRenderer: React.FC<{ content: string }> = memo(({ content }) => {
    // 缓存预处理结果
    const preprocessedContent = useMemo(() => preprocessMarkdown(content), [content]);
    const components = useMemo<Components>(() => ({
        // 标题组件
        h1: ({ node, ...props }) => <Heading1 {...props} />,
        h2: ({ node, ...props }) => <Heading2 {...props} />,
        h3: ({ node, ...props }) => <Heading3 {...props} />,
        h4: ({ node, ...props }) => <Heading4 {...props} />,
        h5: ({ node, ...props }) => <Heading5 {...props} />,
        h6: ({ node, ...props }) => <Heading6 {...props} />,

        // 文本组件
        p: ({ node, ...props }) => <Paragraph {...props} />,
        strong: ({ node, ...props }) => <Strong {...props} />,
        em: ({ node, ...props }) => <Emphasis {...props} />,

        // 列表组件
        ul: ({ node, ...props }) => <UnorderedList {...props} />,
        ol: ({ node, ...props }) => <OrderedList {...props} />,
        li: ({ node, ...props }) => <ListItem {...props} />,

        // 链接和图片
        a: ({ node, ...props }) => <Link {...props} />,
        img: ({ node, ...props }) => <Image {...props} />,
        
        // 代码块组件
        code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const inline = !match;
            return inline ? (
                <InlineCode {...props}>{children}</InlineCode>
            ) : (
                <CodeBlock
                    code={String(children).replace(/\n$/, '')}
                    language={match ? match[1] : undefined}
                />
            );
        },

        // 其他组件
        blockquote: ({ node, ...props }) => <Blockquote {...props} />,
        hr: ({ node, ...props }) => <HorizontalRule {...props} />,
        del: ({ node, ...props }) => <Strikethrough {...props} />,
        input: ({ node, ...props }) => <TaskListItem {...props} />,
        
        // 表格组件
        table: ({ node, ...props }) => <Table {...props} />,
        th: ({ node, ...props }) => <TableHeader {...props} />,
        td: ({ node, ...props }) => <TableCell {...props} />,

        // 数学公式组件
        math: memo(({ value }: { value: string }) => <BlockMath>{value}</BlockMath>),
        inlineMath: memo(({ value }: { value: string }) => <InlineMath>{value}</InlineMath>),
    }), []);

    return (
        <div className="markdown-body">
            <BlurAnimatedWrapper>
                <ReactMarkdown
                    remarkPlugins={remarkPlugins}
                    rehypePlugins={rehypePlugins}
                    components={components}
                    skipHtml
                >
                    {preprocessedContent}
                </ReactMarkdown>
            </BlurAnimatedWrapper>
        </div>
    );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;