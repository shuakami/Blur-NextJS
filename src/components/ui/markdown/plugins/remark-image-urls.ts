import { visit } from 'unist-util-visit';

interface ImageNode {
  type: 'image';
  url?: string;
}

export function remarkImageUrls() {
  return (tree: any) => {
    visit(tree, 'image', (node: ImageNode) => {
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

      // 如果不是以 http(s):// 或 / 开头，添加基础路径
      if (!node.url.startsWith('https://') && !node.url.startsWith('/')) {
        node.url = `/api/images/${node.url}`;
      }
    });
  };
}