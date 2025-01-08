// BlockMenu.tsx

import { FC, useEffect, useRef } from 'react'
import { Editor } from '@tiptap/core'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import './BlockMenu.css'
import { commands, CommandItem } from './commands'

interface BlockMenuProps {
  editor: Editor
}

// 创建固定的popup内容
const createCommandMenu = (items: CommandItem[]) => {
  const component = document.createElement('div')
  component.classList.add(
    'z-50',
    'min-w-[260px]',
    'max-w-[300px]',
    'overflow-y-auto',
    'max-h-[320px]',
    'bg-white',
    'dark:bg-gray-900',
    'rounded-xl',
    'border',
    'border-gray-200',
    'dark:border-gray-800',
    'py-1.5',
    'px-1.5',
    'shadow-[0_5px_30px_-12px_rgba(0,0,0,0.18)]',
    'dark:shadow-[0_5px_30px_-12px_rgba(0,0,0,0.45)]'
  )

  component.innerHTML = `
    <div class="space-y-0.5 max-h-[320px] overflow-y-auto overflow-x-hidden">
      <div class="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">选择块类型</div>
      ${items
        .map(
          (item, index) => `
            <button class="group flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-70 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-80 dark:focus:bg-gray-800 ${
              index === 0 ? 'bg-gray-70 dark:bg-gray-800' : ''
            }" data-index="${index}">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                ${item.icon}
              </div>
              <div class="flex flex-col items-start">
                <span class="text-sm font-medium">${item.title}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">${item.description}</span>
              </div>
            </button>
          `
        )
        .join('')}
    </div>
  `

  return component
}

const BlockMenu: FC<BlockMenuProps> = ({ editor }) => {
  const popupRef = useRef<TippyInstance | null>(null)
  const menuRef = useRef<HTMLElement | null>(null)
  const currentBlockRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // 初始化菜单内容
    menuRef.current = createCommandMenu(commands)

    // 创建tippy实例
    popupRef.current = tippy('body', {
      content: menuRef.current,
      trigger: 'manual',
      interactive: true,
      placement: 'top-start',
      offset: [0, 0],
      appendTo: () => document.body,
      onHide: () => {
        currentBlockRef.current = null
      },
    })[0]

    // 使用事件委托处理命令点击
    if (menuRef.current) {
      menuRef.current.addEventListener('click', (e) => {
        const button = (e.target as HTMLElement).closest('button')
        if (!button) return

        const index = Number(button.getAttribute('data-index'))
        const commandItem = commands[index]
        if (commandItem && currentBlockRef.current) {
          const pos = editor.view.posAtDOM(currentBlockRef.current, 0)
          const node = editor.view.state.doc.resolve(pos).parent
          const isEmpty = node.content.size === 0

          if (isEmpty) {
            editor.commands.setTextSelection(pos)
          }
          commandItem.command({ editor, range: { from: pos, to: pos } })
          popupRef.current?.hide()
        }
      })

      // 鼠标移入高亮
      menuRef.current.addEventListener('mouseover', (e) => {
        const button = (e.target as HTMLElement).closest('button')
        if (!button) return
        const index = Number(button.getAttribute('data-index'))
        highlightItem(index)
      })
    }

    // 获取编辑器DOM元素
    const editorElement = editor.view.dom as HTMLElement

    const handlePlusClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const blockEl = target.closest('.ProseMirror > *') as HTMLElement
      if (!blockEl) return

      // 检查点击位置是否在加号区域
      const rect = blockEl.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // 加号按钮区域：距离左边-44px，宽24px，高24px，垂直居中
      const buttonLeft = -44
      const buttonWidth = 24
      const buttonHeight = 24
      const buttonTop = (rect.height - buttonHeight) / 2

      if (
        x >= buttonLeft &&
        x <= buttonLeft + buttonWidth &&
        y >= buttonTop &&
        y <= buttonTop + buttonHeight
      ) {
        event.preventDefault()
        event.stopPropagation()
        showCommandMenu(blockEl)
      }
    }

    editorElement.addEventListener('click', handlePlusClick)

    return () => {
      editorElement.removeEventListener('click', handlePlusClick)
      popupRef.current?.destroy()
    }
  }, [editor])

  const highlightItem = (index: number) => {
    const buttons = menuRef.current?.querySelectorAll('button')
    if (!buttons) return
    buttons.forEach((btn) => btn.classList.remove('bg-gray-70', 'dark:bg-gray-800'))
    const selectedBtn = menuRef.current?.querySelector(`button[data-index="${index}"]`)
    if (selectedBtn) {
      selectedBtn.classList.add('bg-gray-70', 'dark:bg-gray-800')
      selectedBtn.scrollIntoView({ block: 'nearest' })
    }
  }

  const showCommandMenu = (blockEl: HTMLElement) => {
    currentBlockRef.current = blockEl
    const pos = editor.view.posAtDOM(blockEl, 0)
    const node = editor.view.state.doc.resolve(pos).parent
    const isEmpty = node.content.size === 0

    const originalRect = blockEl.getBoundingClientRect()

    if (!isEmpty) {
      editor.commands.enter()

      popupRef.current?.setProps({
        getReferenceClientRect: () => ({
          width: 0,
          height: 0,
          top: originalRect.top + originalRect.height,
          bottom: originalRect.bottom + originalRect.height,
          left: originalRect.left,
          right: originalRect.left,
          x: originalRect.left,
          y: originalRect.top + originalRect.height,
          toJSON: () => {},
        }),
      })
    } else {
      popupRef.current?.setProps({
        getReferenceClientRect: () => ({
          width: 0,
          height: 0,
          top: originalRect.bottom,
          bottom: originalRect.bottom,
          left: originalRect.left,
          right: originalRect.left,
          x: originalRect.left,
          y: originalRect.bottom,
          toJSON: () => {},
        }),
        placement: 'bottom-start',
      })
    }

    requestAnimationFrame(() => {
      popupRef.current?.show()
    })
  }

  return null
}

export default BlockMenu
