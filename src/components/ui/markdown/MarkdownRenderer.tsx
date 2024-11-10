"use client";
import React, { useMemo, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
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
import remarkCodePreserver from "@/components/ui/markdown/pig/code";

// InlineCode 组件
const InlineCode = memo<React.PropsWithChildren<Record<string, unknown>>>(({ children }) => (
    <code className="inline-code">{children}</code>
));
InlineCode.displayName = 'InlineCode';

// 创建 remarkPlugins 配置
const remarkPlugins = [remarkGfm, remarkMath, remarkCodePreserver];
const rehypePlugins = [rehypeKatex, rehypeRaw];

// 数学公式组件
const MathBlock = memo(({ value }: { value: string }) => <BlockMath>{value}</BlockMath>);
MathBlock.displayName = 'MathBlock';

const InlineMathBlock = memo(({ value }: { value: string }) => <InlineMath>{value}</InlineMath>);
InlineMathBlock.displayName = 'InlineMathBlock';

export const MarkdownRenderer: React.FC<{ content: string }> = memo(({ content }) => {
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
        // @ts-ignore
        code: ({ inline, className, children, ...props }) => {
            if (inline) {
                return <InlineCode {...props}>{children}</InlineCode>;
            }
            
            const codeContent = String(children)
                .replace(/\n$/, '')
                .replace(/^```[\w-]*\n/, '')
                .replace(/```$/, '');
            
            return <CodeBlock code={codeContent} />;
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
                <ReactMarkdown
                    remarkPlugins={remarkPlugins}
                    rehypePlugins={rehypePlugins}
                    components={components}
                    skipHtml={false}
                >
                    {content}
                </ReactMarkdown>
        </div>
    );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
