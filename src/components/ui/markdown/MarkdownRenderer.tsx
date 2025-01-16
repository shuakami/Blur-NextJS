"use client";
import React, { useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import remarkCodePreserver from "@/components/ui/markdown/plugins/code";
import { remarkToolMarkers } from './plugins/remark-tool-markers';

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
import { FootnoteRef, FootnoteBackref } from './footnote';
import { Blockquote } from './blockquote';
import { remarkLinkUrls } from './plugins/remark-link-urls';
import { remarkImageUrls } from './plugins/remark-image-urls';
import CodeBlock from '@/components/ui/markdown/code';
import { Image } from '@/components/ui/markdown/image';
import MathBlock from '@/components/ui/markdown/MathBlock';
import InlineMathBlock from '@/components/ui/markdown/InlineMathBlock';

// 添加类型定义
type DetailsType = React.FC<React.PropsWithChildren<React.HTMLAttributes<HTMLDetailsElement>>>;
type SummaryType = React.FC<React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>>;

// 动态导入
const Details = dynamic(() => 
  import("./details").then(mod => mod.Details as DetailsType), {
    loading: () => null
}) as DetailsType;

const Summary = dynamic(() => 
  import("./details").then(mod => mod.Summary as SummaryType), {
    loading: () => null
}) as SummaryType;

const MermaidRenderer = dynamic(() => import('./MermaidRenderer').then(mod => mod.default), {
  loading: () => null
});

const HeadingOne = ({ children, ...props }: any) => <Heading1 {...props}>{children}</Heading1>;
const HeadingTwo = ({ children, ...props }: any) => <Heading2 {...props}>{children}</Heading2>;
const HeadingThree = ({ children, ...props }: any) => <Heading3 {...props}>{children}</Heading3>;
const HeadingFour = ({ children, ...props }: any) => <Heading4 {...props}>{children}</Heading4>;
const HeadingFive = ({ children, ...props }: any) => <Heading5 {...props}>{children}</Heading5>;
const HeadingSix = ({ children, ...props }: any) => <Heading6 {...props}>{children}</Heading6>;

const ParagraphComponent = ({ children, ...props }: any) => <Paragraph {...props}>{children}</Paragraph>;
const StrongComponent = ({ children, ...props }: any) => <Strong {...props}>{children}</Strong>;
const EmphasisComponent = ({ children, ...props }: any) => <Emphasis {...props}>{children}</Emphasis>;
const BlockquoteComponent = ({ children, ...props }: any) => <Blockquote {...props}>{children}</Blockquote>;

const UnorderedListComponent = ({ children, ...props }: any) => <UnorderedList {...props}>{children}</UnorderedList>;
const OrderedListComponent = ({ children, ...props }: any) => <OrderedList {...props}>{children}</OrderedList>;
const ListItemComponent = ({ children, ...props }: any) => <ListItem {...props}>{children}</ListItem>;

const LinkComponent = ({ node, children, ...props }: any) => {
  const href = node?.properties?.href || node?.url || props.href || '';
  return <Link href={href.replace('sandbox:/', '')} {...props}>{children}</Link>;
};
const ImageComponent = ({ src, alt, ...props }: any) => <Image src={src} alt={alt} {...props} />;

const TableComponent = ({ children, ...props }: any) => <Table {...props}>{children}</Table>;
const TableHeaderComponent = ({ children, ...props }: any) => <TableHeader {...props}>{children}</TableHeader>;
const TableCellComponent = ({ children, ...props }: any) => <TableCell {...props}>{children}</TableCell>;

const HorizontalRuleComponent = (props: any) => <HorizontalRule {...props} />;

// 内联组件
const InlineCode = memo<React.PropsWithChildren<Record<string, unknown>>>(({ children }) => (
  <code className="inline-code">{children}</code>
));
InlineCode.displayName = 'InlineCode';

const CodeComponent = ({ inline, className, children, ...props }: any) => {
  if (inline) {
    return <InlineCode {...props}>{children}</InlineCode>;
  }

  const codeContent = String(children);
  
  if (className === 'language-mermaid' || codeContent.trim().startsWith('```mermaid')) {
    const cleanedMermaid = codeContent
      .replace(/^```mermaid\n/, '')
      .replace(/```$/, '')
      .trim();
    return <MermaidRenderer chart={cleanedMermaid} />;
  }

  let language: string | undefined;
  const codeBlockMatch = codeContent.match(/^```([\w-]*)\n/);
  if (codeBlockMatch) {
    language = codeBlockMatch[1] || undefined;
  } else if (className) {
    const langMatch = className.match(/language-([\w-]*)/);
    language = langMatch?.[1];
  }
  
  const cleanedCode = codeContent
    .replace(/\n$/, '')
    .replace(/^```[\w-]*\n/, '')
    .replace(/```$/, '');
  
  return <CodeBlock 
    code={cleanedCode} 
    language={language}
  />;
};

export const MarkdownRenderer: React.FC<{ 
    content: string;
    isStreaming?: boolean;
}> = memo(({ content, isStreaming = false }) => {
  const remarkPlugins = useMemo(() => [
    remarkGfm,
    remarkMath,
    remarkCodePreserver,
    remarkLinkUrls,    
    remarkImageUrls,
    remarkToolMarkers,
  ], []);

  const rehypePlugins = useMemo(() => [
    rehypeKatex, 
    rehypeRaw
  ], []);

  const components = useMemo<Components>(() => ({
    h1: HeadingOne,
    h2: HeadingTwo,
    h3: HeadingThree,
    h4: HeadingFour,
    h5: HeadingFive,
    h6: HeadingSix,

    p: ParagraphComponent,
    strong: StrongComponent,
    em: EmphasisComponent,
    blockquote: BlockquoteComponent,

    ul: UnorderedListComponent,
    ol: OrderedListComponent,
    li: ListItemComponent,

    a: LinkComponent,
    img: ImageComponent,
    
    code: CodeComponent,

    table: TableComponent,
    th: TableHeaderComponent,
    td: TableCellComponent,

    math: MathBlock,
    inlineMath: InlineMathBlock,

    hr: HorizontalRuleComponent,

    details: Details as any,
    summary: Summary as any,

    footnoteReference: FootnoteRef,
    footnoteBackReference: FootnoteBackref,
  }), []);

  return (
    <div className={`markdown-body ${isStreaming ? 'result-streaming' : ''}`}>
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