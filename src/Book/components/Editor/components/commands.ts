// commands.ts

import { Editor } from '@tiptap/core'

export interface CommandItem {
  title: string
  description?: string
  icon?: string
  command: (params: { editor: Editor; range?: any }) => void
}

export const commands: CommandItem[] = [
  {
    title: '文本',
    description: '普通文本块',
    icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    command: ({ editor }) => {
      editor.chain().focus().setNode('paragraph').run()
    },
  },
  {
    title: '标题1',
    description: '一级标题',
    icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7h18M7 3v18M17 3v18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    command: ({ editor }) => {
      editor.chain().focus().setNode('heading', { level: 1 }).run()
    },
  },
  {
    title: '标题2',
    description: '二级标题',
    icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7h18M7 3v18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    command: ({ editor }) => {
      editor.chain().focus().setNode('heading', { level: 2 }).run()
    },
  },
  {
    title: '无序列表',
    description: '项目符号列表',
    icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    command: ({ editor }) => {
      editor.chain().focus().toggleBulletList().run()
    },
  },
  {
    title: '有序列表',
    description: '数字编号列表',
    icon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    command: ({ editor }) => {
      editor.chain().focus().toggleOrderedList().run()
    },
  },
]
