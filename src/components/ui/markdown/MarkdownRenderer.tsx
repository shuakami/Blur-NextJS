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
    const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g;
    let insideCodeBlock = false;

    // 如果没有代码块标记，直接返回原内容
    if (!codeBlockRegex.test(content)) {
        return content;
    }

    // 处理未闭合的代码块
    const lines = content.split('\n');
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

// 数学公式组件
const MathBlock = memo(({ value }: { value: string }) => <BlockMath>{value}</BlockMath>);
MathBlock.displayName = 'MathBlock';

const InlineMathBlock = memo(({ value }: { value: string }) => <InlineMath>{value}</InlineMath>);
InlineMathBlock.displayName = 'InlineMathBlock';

export const MarkdownRenderer: React.FC<{ content: string }> = memo(({ content }) => {
    // 缓存预处理结果
    const preprocessedContent = useMemo(() => preprocessMarkdown(content), [content]);
    const components = useMemo<Components>(() => ({
        // 标题组件
        h1: ({ children, ...props }) => <Heading1 {...props}>{children}</Heading1>,
        h2: ({ children, ...props }) => <Heading2 {...props}>{children}</Heading2>,
        h3: ({ children, ...props }) => <Heading3 {...props}>{children}</Heading3>,
        h4: ({ children, ...props }) => <Heading4 {...props}>{children}</Heading4>,
        h5: ({ children, ...props }) => <Heading5 {...props}>{children}</Heading5>,
        h6: ({ children, ...props }) => <Heading6 {...props}>{children}</Heading6>,

        // 文本组件
        p: ({ children, ...props }) => <Paragraph {...props}>{children}</Paragraph>,
        strong: ({ children, ...props }) => <Strong {...props}>{children}</Strong>,
        em: ({ children, ...props }) => <Emphasis {...props}>{children}</Emphasis>,

        // 列表组件
        ul: ({ children, ...props }) => <UnorderedList {...props}>{children}</UnorderedList>,
        ol: ({ children, ...props }) => <OrderedList {...props}>{children}</OrderedList>,
        li: ({ children, ...props }) => <ListItem {...props}>{children}</ListItem>,

        // 链接和图片
        a: ({ children, ...props }) => <Link {...props}>{children}</Link>,
        img: ({ src, alt = '', ...props }) => <Image src={src} alt={alt} {...props} />,
        
        // 代码块组件
        code: ({ className, children, ...props }) => {
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
        blockquote: ({ children, ...props }) => <Blockquote {...props}>{children}</Blockquote>,
        hr: (props) => <HorizontalRule {...props} />,
        del: ({ children, ...props }) => <Strikethrough {...props}>{children}</Strikethrough>,
        input: (props) => <TaskListItem {...props} />,
        
        // 表格组件
        table: ({ children, ...props }) => <Table {...props}>{children}</Table>,
        th: ({ children, ...props }) => <TableHeader {...props}>{children}</TableHeader>,
        td: ({ children, ...props }) => <TableCell {...props}>{children}</TableCell>,

        // 数学公式组件
        math: MathBlock,
        inlineMath: InlineMathBlock,
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