// lib/contentUtils.ts

import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import strip from 'strip-markdown';
import remarkStringify from 'remark-stringify';
// @ts-ignore
import {Root} from 'unist';

// 定义需要计数的非文本元素类型
const NON_TEXT_ELEMENTS = ['image', 'video', 'audio', 'code', 'codeBlock', 'blockquote', 'table'];

/**
 * 统计 MDX 内容中的非文本元素数量
 * @param {string} content - MDX 内容
 * @returns {Promise<number>} 非文本元素的数量
 */
export const countNonTextElements = async (content: string): Promise<number> => {
    let count = 0;

    const processor = unified()
        .use(remarkParse)
        .use(remarkMdx);

    const tree: Root = processor.parse(content);

    const visit = (node: any) => {
        if (NON_TEXT_ELEMENTS.includes(node.type)) {
            count += 1;
        }
        if (node.children && Array.isArray(node.children)) {
            node.children.forEach((child: any) => visit(child));
        }
    };

    visit(tree);

    return count;
};

/**
 * 提取 MDX 内容中的纯文本
 * @param {string} content - MDX 内容
 * @returns {Promise<string>} 纯文本
 */
export const extractPlainText = async (content: string): Promise<string> => {
    const processor = unified()
        .use(remarkParse) // 解析 Markdown
        .use(remarkMdx) // 解析 MDX
        .use(strip) // 移除多余的 Markdown 语法
        .use(remarkStringify); // 将其转换为纯文本字符串

    // 确保解析完成
    const file = await processor.process(content);
    const result = String(file);

    return result;
};