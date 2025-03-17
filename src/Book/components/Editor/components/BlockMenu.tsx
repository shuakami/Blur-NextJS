import { FC, useEffect, useRef, useCallback, useState } from 'react'
import { Editor } from '@tiptap/core'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import './BlockMenu.css'
import { commands, CommandItem } from './commands'

interface BlockMenuProps {
  editor: Editor
}

// 创建固定的 popup 内容节点
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
            <button class="group flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-70 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-80 dark:focus:bg-gray-800" data-index="${index}">
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

// 键盘导航逻辑
const useCommandKeyboard = ({
  items,
  onConfirm,
  isOpen,
  onClose
}: {
  items: CommandItem[]
  onConfirm: (index: number) => void
  isOpen: boolean
  onClose?: () => void
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen || !items.length) return false

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
        return true
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % items.length)
        return true
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        onConfirm(selectedIndex)
        return true
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
        return true
      }

      return false
    },
    [items, isOpen, selectedIndex, onConfirm, onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    selectedIndex,
    setSelectedIndex
  }
}

// 安全获取块在文档中的位置
const getValidPosition = (editor: Editor, element: HTMLElement): number | null => {
  try {
    const pos = editor.view.posAtDOM(element, 0)
    return pos >= 0 ? pos : null
  } catch (err) {
    console.warn('[BlockMenu] 获取DOM位置失败:', err)
    return null
  }
}

// 改进后的「空块」判断逻辑：遍历子节点检查文本长度是否为 0
const checkNodeIsEmpty = (editor: Editor, pos: number): boolean => {
  try {
    const node = editor.view.state.doc.resolve(pos).parent
    if (!node) return false

    let totalTextLength = 0
    // 遍历该节点下所有后代，累加 textContent
    node.descendants((child) => {
      totalTextLength += (child.textContent || '').length
    })

    // 如果所有文本加起来是 0，就视为空块
    return totalTextLength === 0
  } catch (err) {
    console.warn('[BlockMenu] 检查节点是否为空失败:', err)
    return false
  }
}

const BlockMenu: FC<BlockMenuProps> = ({ editor }) => {
  const popupRef = useRef<TippyInstance | null>(null)
  const menuRef = useRef<HTMLElement | null>(null)

  // 用来记录当前展示菜单的块元素和它在文档中的位置
  const currentBlockElRef = useRef<HTMLElement | null>(null)
  const currentBlockPosRef = useRef<number | null>(null)

  const scrollPositionRef = useRef(0)
  const [isOpen, setIsOpen] = useState(false)

  // 使用自定义的键盘导航Hook
  const { selectedIndex, setSelectedIndex } = useCommandKeyboard({
    items: commands,
    onConfirm: (index) => {
      const command = commands[index]
      if (command) {
        executeCommand(command)
      }
    },
    isOpen,
    onClose: () => {
      popupRef.current?.hide()
    }
  })

  // 禁用/恢复滚动
  const disableScroll = () => {
    scrollPositionRef.current = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollPositionRef.current}px`
    document.body.style.width = '100%'
  }
  const enableScroll = () => {
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, scrollPositionRef.current)
  }

  // 初始化 Tippy 实例
  useEffect(() => {
    console.log('=== 初始化 Tippy 实例 ===')
    menuRef.current = createCommandMenu(commands)

    popupRef.current = tippy(document.body, {
      content: menuRef.current!,
      trigger: 'manual',
      interactive: true,
      appendTo: document.body,
      placement: 'bottom-start',
      offset: ({ placement }) => {
        // 上方翻转时距离稍大
        if (placement.includes('top')) {
          return [0, 35]
        }
        return [0, 10]
      },
      popperOptions: {
        strategy: 'absolute',
        modifiers: [
          {
            name: 'flip',
            enabled: true,
            options: {
              fallbackPlacements: ['top-start']
            }
          }
        ]
      },
      onShow: () => {
        disableScroll()
      },
      onHide: () => {
        enableScroll()
        // 隐藏时清空引用
        currentBlockElRef.current = null
        currentBlockPosRef.current = null
        setIsOpen(false)
      }
    }) as TippyInstance

    // 点击事件委托：点击菜单按钮 -> 执行对应命令
    menuRef.current.addEventListener('click', (e) => {
      const button = (e.target as HTMLElement).closest('button')
      if (!button) return
      const index = Number(button.getAttribute('data-index'))
      const command = commands[index]
      if (command) {
        executeCommand(command)
      }
    })

    // 鼠标移入 -> 高亮对应按钮
    menuRef.current.addEventListener('mouseover', (e) => {
      const button = (e.target as HTMLElement).closest('button')
      if (!button) return
      const index = Number(button.getAttribute('data-index'))
      highlightItem(index)
    })

    // 监听编辑器DOM，点击加号时触发
    const editorElement = editor.view.dom as HTMLElement
    const handlePlusClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const blockEl = target.closest('.ProseMirror > *') as HTMLElement
      if (!blockEl) return

      const rect = blockEl.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // 此处根据 UI 自行调整加号触发区域
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
      enableScroll()
      popupRef.current?.destroy()
    }
  }, [editor])

  // 高亮某一个菜单项
  const highlightItem = useCallback(
    (index: number) => {
      setSelectedIndex(index)
      const buttons = menuRef.current?.querySelectorAll('button')
      if (!buttons) return
      buttons.forEach((btn) => btn.classList.remove('bg-gray-70', 'dark:bg-gray-800'))

      const selectedBtn = menuRef.current?.querySelector(`button[data-index="${index}"]`)
      if (selectedBtn) {
        selectedBtn.classList.add('bg-gray-70', 'dark:bg-gray-800')
        selectedBtn.scrollIntoView({ block: 'nearest' })
      }
    },
    [setSelectedIndex]
  )

  // 显示命令菜单
  const showCommandMenu = (blockEl: HTMLElement) => {
    console.log('\n=== 显示命令菜单 ===')
    const originalPos = getValidPosition(editor, blockEl)
    if (originalPos === null) {
      console.log('[BlockMenu] 无效的块位置')
      return
    }
    const isEmpty = checkNodeIsEmpty(editor, originalPos)
    const originalRect = blockEl.getBoundingClientRect()

    // 动态更新 Tippy 定位
    const updatePosition = (rect: DOMRect) => {
      popupRef.current?.setProps({
        getReferenceClientRect: () => ({
          width: 0,
          height: 0,
          top: rect.bottom + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          left: rect.left,
          right: rect.left,
          x: rect.left,
          y: rect.bottom + window.scrollY,
          toJSON: () => {}
        })
      })
    }

    // 根据是否「真正有文字」来判断是否先enter
    if (!isEmpty) {
      // 原逻辑：如果块是非空，就先 enter() -> 找下一块
      editor.commands.enter()

      const newBlock = blockEl.nextElementSibling as HTMLElement | null
      if (!newBlock) {
        console.warn('[BlockMenu] 未找到新建块')
        return
      }
      const newPos = getValidPosition(editor, newBlock)
      if (newPos === null) {
        console.warn('[BlockMenu] 新建块位置无效')
        return
      }
      currentBlockElRef.current = newBlock
      currentBlockPosRef.current = newPos

      const newRect = newBlock.getBoundingClientRect()
      updatePosition(newRect)
    } else {
      // 块是空的，直接用当前块
      currentBlockElRef.current = blockEl
      currentBlockPosRef.current = originalPos
      updatePosition(originalRect)
    }

    requestAnimationFrame(() => {
      popupRef.current?.show()
      setIsOpen(true)
    })
  }

  // 执行命令
  const executeCommand = (commandItem: CommandItem) => {
    const blockPos = currentBlockPosRef.current
    if (blockPos === null) {
      console.warn('[BlockMenu] 无效的块位置(执行命令时)', blockPos)
      return
    }

    // 如果还是空块，就设置选区
    const isEmpty = checkNodeIsEmpty(editor, blockPos)
    if (isEmpty) {
      editor.commands.setTextSelection(blockPos)
    }

    // 执行命令
    commandItem.command({
      editor,
      range: { from: blockPos, to: blockPos }
    })

    // 命令执行后，立即隐藏菜单
    popupRef.current?.hide()
  }

  return null
}

export default BlockMenu
