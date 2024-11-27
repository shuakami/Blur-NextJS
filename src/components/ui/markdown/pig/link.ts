import { visit } from 'unist-util-visit';

export function remarkSandboxLinks() {
  return (tree: any) => {
    visit(tree, 'link', (node: any) => {
      if (node.url && node.url.startsWith('sandbox:/')) {
        node.url = node.url.replace('sandbox:/', '');
      }
    });
  };
}