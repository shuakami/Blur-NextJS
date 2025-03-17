import StarterKit from '@tiptap/starter-kit';
import { BlockConfig } from './types';
import { Editor, Extension } from '@tiptap/core';
import { BlockRegistry } from './BlockRegistry';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';

/**
 * 默认块类型定义
 */
export const defaultBlocks: BlockConfig[] = [
  {
    id: 'paragraph',
    type: 'paragraph',
    title: '文本',
    description: '普通文本块',
    icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    extension: StarterKit as unknown as Extension,
    command: (editor: Editor) => {
      editor.chain().focus().setNode('paragraph').run();
    }
  },
  {
    id: 'heading-1',
    type: 'heading',
    title: '标题1',
    description: '一级标题',
    icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7h18M7 3v18M17 3v18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    extension: StarterKit as unknown as Extension,
    attributes: {
      level: 1
    },
    command: (editor: Editor) => {
      editor.chain().focus().setNode('heading', { level: 1 }).run();
    }
  },
  {
    id: 'heading-2',
    type: 'heading',
    title: '标题2',
    description: '二级标题',
    icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7h18M7 3v18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    extension: StarterKit as unknown as Extension,
    attributes: {
      level: 2
    },
    command: (editor: Editor) => {
      editor.chain().focus().setNode('heading', { level: 2 }).run();
    }
  },
  {
    id: 'bullet-list',
    type: 'bulletList',
    title: '无序列表',
    description: '项目符号列表',
    icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    extension: BulletList as unknown as Extension,
    command: (editor: Editor) => {
      editor.chain().focus().toggleBulletList().run();
    }
  },
  {
    id: 'ordered-list',
    type: 'orderedList',
    title: '有序列表',
    description: '数字编号列表',
    icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    extension: OrderedList as unknown as Extension,
    command: (editor: Editor) => {
      editor.chain().focus().toggleOrderedList().run();
    }
  }
];

/**
 * 注册默认块类型
 * @param registry 块注册表实例
 * @throws 如果注册过程中出现错误
 */
export function registerDefaultBlocks(registry: BlockRegistry): void {
  try {
    defaultBlocks.forEach(block => {
      registry.register(block);
    });
  } catch (error) {
    console.error('注册默认块类型时出错:', error);
    throw error;
  }
} 