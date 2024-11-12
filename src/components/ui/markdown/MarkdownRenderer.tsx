"use client";
import React, { useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import remarkCodePreserver from "@/components/ui/markdown/pig/code";

// 基础文本组件
import { Paragraph, Strong, Emphasis } from './text';
import { Link } from './link';
import { HorizontalRule } from './horizontalRule';
import {
  Heading1, Heading2, Heading3,
  Heading4, Heading5, Heading6
} from './headings';
import {
  UnorderedList, OrderedList, ListItem
} from './lists';
import {
  Table, TableHeader, TableCell
} from './table';

// 骨架屏
import {
  CodeBlockSkeleton,
  BlockMathSkeleton,
  InlineMathSkeleton,
  ImageSkeleton
} from './skeleton/skeleton';
import { Blockquote } from './blockquote';

// 动态导入
const CodeBlock = dynamic(() => import("@/components/ui/markdown/code"), {
    loading: () => <CodeBlockSkeleton />
});
const Image = dynamic(() => import("@/components/ui/markdown/image").then(mod => mod.Image), {
    loading: () => <ImageSkeleton />
});
const BlockMath = dynamic(() => import("@/components/ui/markdown/MathRenderer").then(mod => mod.BlockMath), {
    loading: () => <BlockMathSkeleton />
});
const InlineMath = dynamic(() => import("@/components/ui/markdown/MathRenderer").then(mod => mod.InlineMath), {
    loading: () => <InlineMathSkeleton />
});
const Details = dynamic(() => import("./details").then(mod => mod.Details), {
    loading: () => null
});
const Summary = dynamic(() => import("./details").then(mod => mod.Summary), {
    loading: () => null
});



// 轻量级的内联组件
const InlineCode = memo<React.PropsWithChildren<Record<string, unknown>>>(({ children }) => (
  <code className="inline-code">{children}</code>
));
InlineCode.displayName = 'InlineCode';

const remarkPlugins = [remarkGfm, remarkMath, remarkCodePreserver];
const rehypePlugins = [rehypeKatex, rehypeRaw];

// 数学公式组件包装器
const MathBlock = memo(({ children }: { children: React.ReactNode }) => {
    const value = String(children).trim();
    return <BlockMath>{value}</BlockMath>;
  });
  MathBlock.displayName = 'MathBlock';
  
  const InlineMathBlock = memo(({ children }: { children: React.ReactNode }) => {
    const value = String(children).trim();
    return <InlineMath>{value}</InlineMath>;
  });
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

    // 基础文本组件
    p: ({ children, ...props }) => <Paragraph {...props}>{children}</Paragraph>,
    strong: ({ children, ...props }) => <Strong {...props}>{children}</Strong>,
    em: ({ children, ...props }) => <Emphasis {...props}>{children}</Emphasis>,
    blockquote: ({ children, ...props }) => <Blockquote {...props}>{children}</Blockquote>,

    // 列表组件
    ul: ({ children, ...props }) => <UnorderedList {...props}>{children}</UnorderedList>,
    ol: ({ children, ...props }) => <OrderedList {...props}>{children}</OrderedList>,
    li: ({ children, ...props }) => <ListItem {...props}>{children}</ListItem>,

    // 链接和图片
    a: ({ children, ...props }) => <Link {...props}>{children}</Link>,
    img: ({ src, alt, ...props }) => <Image src={src} alt={alt} {...props} />,
    
    // 代码块
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

    // 表格组件
    table: ({ children, ...props }) => <Table {...props}>{children}</Table>,
    th: ({ children, ...props }) => <TableHeader {...props}>{children}</TableHeader>,
    td: ({ children, ...props }) => <TableCell {...props}>{children}</TableCell>,

    // 数学公式组件
    math: MathBlock,
    inlineMath: InlineMathBlock,

    // 其他基础组件
    hr: ({ ...props }) => <HorizontalRule {...props} />,

    // 折叠器组件
    details: ({ children, ...props }) => <Details {...props}>{children}</Details>,
    summary: ({ children, ...props }) => <Summary {...props}>{children}</Summary>,
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
