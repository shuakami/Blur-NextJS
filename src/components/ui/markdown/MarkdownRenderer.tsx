"use client";
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

import { Heading1, Heading2, Heading3, Heading4, Heading5, Heading6 } from './headings';
import { Paragraph, Strong, Emphasis } from './text';
import { UnorderedList, OrderedList, ListItem } from './lists';
import { Link } from './link';
import { Image } from './image';
import { CodeBlock } from './code';
import { Blockquote } from './blockquote';
import { HorizontalRule } from './horizontalRule';
import { Table, TableHeader, TableCell } from './table';
import { TaskListItem } from './taskList';
import { Strikethrough } from './strikethrough';

// 定义 InlineCode 组件
const InlineCode: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => (
    <code>{children}</code>
);

// 预处理 Markdown 内容，确保所有代码块都已闭合，并正确区分代码块和内联代码
const preprocessMarkdown = (content: string): string => {
    const lines = content.split('\n');
    let insideCodeBlock = false;
    const processedLines: string[] = [];

    lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('```')) {
            insideCodeBlock = !insideCodeBlock;
        }
        processedLines.push(line);
    });

    // 如果文件以未闭合的代码块结尾，自动添加闭合 ```
    if (insideCodeBlock) {
        processedLines.push('```');
    }

    return processedLines.join('\n');
};

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const preprocessedContent = preprocessMarkdown(content);

        const components: Components = {
                h1: ({ ...props }) => <Heading1 {...props} />,
                h2: ({ ...props }) => <Heading2 {...props} />,
                h3: ({ ...props }) => <Heading3 {...props} />,
                h4: ({ ...props }) => <Heading4 {...props} />,
                h5: ({ ...props }) => <Heading5 {...props} />,
                h6: ({ ...props }) => <Heading6 {...props} />,
                p: ({ ...props }) => <Paragraph {...props} />,
                strong: ({ ...props }) => <Strong {...props} />,
                em: ({ ...props }) => <Emphasis {...props} />,
                ul: ({ ...props }) => <UnorderedList {...props} />,
                ol: ({ ...props }) => <OrderedList {...props} />,
                li: ({ ...props }) => <ListItem {...props} />,
                a: ({ ...props }) => <Link {...props} />,
                img: ({ ...props }) => <Image {...props} />,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                code: ({ inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return inline ? (
                            <InlineCode {...props}>{children}</InlineCode>
                        ) : (
                            <CodeBlock
                                code={String(children).replace(/\n$/, '')}
                                language={match ? match[1] : undefined}
                            />
                        );
                },
                blockquote: ({ ...props }) => <Blockquote {...props} />,
                hr: ({ ...props }) => <HorizontalRule {...props} />,
                del: ({ ...props }) => <Strikethrough {...props} />,
                input: ({ ...props }) => <TaskListItem {...props} />,
                table: ({ ...props }) => <Table {...props} />,
                th: ({ ...props }) => <TableHeader {...props} />,
                td: ({ ...props }) => <TableCell {...props} />,
        };

        return (
            <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                        {preprocessedContent}
                    </ReactMarkdown>
            </div>
        );
};
