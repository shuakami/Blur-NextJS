// use client;
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

// 定义节点类型
interface InlineCodeNode extends Node {
  type: 'inlineCode';
  value: string;
}

interface CodeNode extends Node {
  type: 'code';
  lang?: string;
  value: string;
}

/**
 * remarkCodePreserver 插件
 * 该插件用于处理 Markdown 中的代码块和行内代码，确保它们的格式正确。
 * @returns {Plugin} 返回一个插件函数
 */
const remarkCodePreserver: Plugin = () => (tree: any) => {
  visit(tree, 'inlineCode', (node: InlineCodeNode) => {
    if (typeof node.value === 'string' && /^`{1,3}.+/.test(node.value)) {
      node.value = `\`${node.value}\``;
    }
  });

  visit(tree, 'code', (node: CodeNode) => {
    if (typeof node.value === 'string') {
      node.value = `\`\`\`${node.lang || ''}\n${node.value}\n\`\`\``;
    }
  });
};

export default remarkCodePreserver;
