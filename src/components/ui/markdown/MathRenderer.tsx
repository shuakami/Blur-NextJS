// src/components/ui/markdown/MarkdownRenderer.tsx
import dynamic from 'next/dynamic';
import React from 'react';
import 'katex/dist/katex.min.css';

// 动态导入 react-katex 的 InlineMath
const DynamicInlineMath = dynamic(() =>
    import('react-katex').then((mod) => mod.InlineMath), { ssr: false }
);

export const InlineMath: React.FC<{ children: string }> = ({ children }) => {
    // @ts-ignore
    return <DynamicInlineMath>{children}</DynamicInlineMath>;
};

// 动态导入 react-katex 的 BlockMath
const DynamicBlockMath = dynamic(() =>
    import('react-katex').then((mod) => mod.BlockMath), { ssr: false }
);

export const BlockMath: React.FC<{ children: string }> = ({ children }) => {
    // @ts-ignore
    return <DynamicBlockMath>{children}</DynamicBlockMath>;
};