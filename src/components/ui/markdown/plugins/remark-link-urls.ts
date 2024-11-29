import { visit } from 'unist-util-visit';

interface LinkNode {
  type: 'link';
  url?: string;
}

export function remarkLinkUrls() {
  return (tree: any) => {
    visit(tree, 'link', (node: LinkNode) => {
      if (!node.url) return;

      // 处理 sandbox:/ 协议
      if (node.url.startsWith('sandbox:/')) {
        node.url = node.url.replace('sandbox:/', '/');
        return;
      }

      // 处理 http 链接
      if (node.url.startsWith('http:')) {
        node.url = node.url.replace('http:', 'https:');
        return;
      }

      // 如果是相对路径，保持原样（让前端组件处理）
      // 因为前端组件需要访问 window.location 来构建完整路径
    });
  };
}