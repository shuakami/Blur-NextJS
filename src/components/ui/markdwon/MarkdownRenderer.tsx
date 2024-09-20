"use client";
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Heading1, Heading2, Heading3, Heading4, Heading5, Heading6 } from './headings';
import { Paragraph, Strong, Emphasis } from './text';
import { UnorderedList, OrderedList, ListItem } from './lists';
import { Link } from './link';
import { Image } from './image';
import { InlineCode, CodeBlock } from './code';
import { Blockquote } from './blockquote';
import { HorizontalRule } from './horizontalRule';
import { Table, TableHeader, TableCell } from './table';
import { TaskListItem } from './taskList';
import { Strikethrough } from './strikethrough';

// 定义扩展的 Props，包含 inline 属性
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
        inline?: boolean;
}

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => (
    <div className="markdown-body">
            <ReactMarkdown
                children={content}
                remarkPlugins={[remarkGfm]}
                components={{
                        h1: Heading1 as any,
                        h2: Heading2 as any,
                        h3: Heading3 as any,
                        h4: Heading4 as any,
                        h5: Heading5 as any,
                        h6: Heading6 as any,
                        p: Paragraph as any,
                        strong: Strong as any,
                        em: Emphasis as any,
                        ul: UnorderedList as any,
                        ol: OrderedList as any,
                        li: ListItem as any,
                        a: Link as any,
                        img: Image as any,
                        code: ({ inline, ...props }: CodeProps) =>
                            inline ? <InlineCode {...props} /> : <CodeBlock {...props} />,
                        blockquote: Blockquote as any,
                        hr: HorizontalRule as any,
                        del: Strikethrough as any,
                        input: TaskListItem as any,
                        table: Table as any,
                        th: TableHeader as any,
                        td: TableCell as any,
                }}
            />
    </div>
);
