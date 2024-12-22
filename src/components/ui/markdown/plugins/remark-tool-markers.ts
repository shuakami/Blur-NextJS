import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

interface TextNode extends Node {
  type: string;
  value: string;
}

// 预编译正则表达式
const TOOL_MARKER_REGEX = new RegExp(
  '\\[(?:USE_TOOL|MEMORY)[^\\]]*\\][\\s\\S]*?\\[\\/(?:USE_TOOL|MEMORY)\\]', 'g'
);
const PARTIAL_MARKER_REGEX = new RegExp(
  '\\[((?:\\/)?(?:USE|USE_|USE_T|USE_TO|USE_TOO|USE_TOOL|M|ME|MEM|MEMO|MEMOR|MEMORY))(?:[^\\]]*)?\\]?'
);

// 缓存模板字符串
const HIDDEN_TEMPLATE = (content: string) => 
  `<span class="hidden tool-marker">${content}</span>`;
const INVISIBLE_TEMPLATE = (content: string) => 
  `<span class="invisible tool-marker-partial">${content}</span>`;

export const remarkToolMarkers: Plugin = () => {
  return (tree: Node) => {
    visit(tree, 'text', (node: TextNode) => {
      // 先检查长度
      if (node.value.length > 0) {
        if (node.value.includes('[') && TOOL_MARKER_REGEX.test(node.value)) {
          (node as any).type = 'html';
          node.value = HIDDEN_TEMPLATE(node.value);
          return;
        }

        if (node.value.includes('[') && PARTIAL_MARKER_REGEX.test(node.value)) {
          (node as any).type = 'html';
          node.value = INVISIBLE_TEMPLATE(node.value);
        }
      }
    });
  };
}; 