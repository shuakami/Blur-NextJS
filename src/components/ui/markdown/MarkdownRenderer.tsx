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

// 修改预处理函数
const preprocessMarkdown = (content: string): string => {
    const lines = content.split('\n');
    const processedLines: string[] = [];
    let insideCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // 检查是否进入或离开代码块
        if (line.trim().startsWith('```')) {
            insideCodeBlock = !insideCodeBlock;
            processedLines.push(line);
            continue;
        }

        if (insideCodeBlock) {
            // 在代码块内，保持原样
            processedLines.push(line);
        } else {
            // 在代码块外
            if (line.match(/^\s*>/)) {
                // 引用块：保留一个空格
                line = line.replace(/^\s*>(\s*)/, '> ');
                processedLines.push(line);
            } else if (line.match(/^\s*`[^`]+`\s*$/)) {
                // 行内代码：保持原样
                processedLines.push(line);
            } else if (line.match(/^\s+/) && !line.match(/^\s{4,}/)) {
                // 普通缩进行：移除多余空格
                processedLines.push(line.trimLeft());
            } else {
                // 其他情况：保持原样
                processedLines.push(line);
            }
        }
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
            const content = String(children).replace(/\n$/, '');
            
            // 精确判断代码块类型
            if (match) {
                // 有语言标记的代码块
                return (
                    <CodeBlock
                        code={content}
                        language={match[1]}
                    />
                );
            } else if (content.includes('\n')) {
                // 多行无语言标记的代码块
                return (
                    <CodeBlock
                        code={content}
                        language="plaintext"
                    />
                );
            } else {
                // 行内代码
                return <InlineCode>{content}</InlineCode>;
            }
        },

        // 其他组件
        blockquote: ({ children, ...props }) => (
            <Blockquote {...props}>
                {children}
            </Blockquote>
        ),
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