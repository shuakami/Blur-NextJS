// BlockMenu.tsx

import {FC, useEffect, useRef, useCallback, useState} from 'react'
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

// 添加useCommandKeyboard hook
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

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
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
    }, [items, isOpen, selectedIndex, onConfirm, onClose])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    return {
        selectedIndex,
        setSelectedIndex
    }
}

const BlockMenu: FC<BlockMenuProps> = ({ editor }) => {
  const popupRef = useRef<TippyInstance | null>(null)
  const menuRef = useRef<HTMLElement | null>(null)
  const currentBlockRef = useRef<HTMLElement | null>(null)
    const scrollPositionRef = useRef(0)
    const [isOpen, setIsOpen] = useState(false)

    // 使用hook
    const {selectedIndex, setSelectedIndex} = useCommandKeyboard({
        items: commands,
        onConfirm: (index) => {
            const commandItem = commands[index]
            if (commandItem && currentBlockRef.current) {
                const pos = editor.view.posAtDOM(currentBlockRef.current, 0)
                commandItem.command({editor, range: {from: pos, to: pos}})
                popupRef.current?.hide()
            }
        },
        isOpen,
        onClose: () => {
            popupRef.current?.hide()
        }
    })

    // 禁用滚动
    const disableScroll = () => {
        scrollPositionRef.current = window.scrollY
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollPositionRef.current}px`
        document.body.style.width = '100%'
    }

    // 启用滚动
    const enableScroll = () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollPositionRef.current)
    }

  useEffect(() => {
      console.log('=== 初始化Tippy实例 ===')
    menuRef.current = createCommandMenu(commands)

      popupRef.current = tippy(document.body, {
      content: menuRef.current,
      trigger: 'manual',
      interactive: true,
          placement: 'bottom-start',
          offset: [0, 10],
          appendTo: document.body,
          popperOptions: {
              modifiers: [{
                  name: 'flip',
                  enabled: false
              }]
          },
          onShow: () => {
              disableScroll()
          },
      onHide: () => {
          enableScroll()
        currentBlockRef.current = null
          setIsOpen(false)
      }
      }) as TippyInstance

      console.log('Tippy实例创建完成', {
          placement: popupRef.current.props.placement,
          offset: popupRef.current.props.offset
      })

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
        enableScroll() // 清理时确保恢复滚动
      popupRef.current?.destroy()
    }
  }, [editor])

    // 修改highlightItem函数,使用selectedIndex
    const highlightItem = useCallback((index: number) => {
        setSelectedIndex(index)
    const buttons = menuRef.current?.querySelectorAll('button')
    if (!buttons) return
    buttons.forEach((btn) => btn.classList.remove('bg-gray-70', 'dark:bg-gray-800'))
    const selectedBtn = menuRef.current?.querySelector(`button[data-index="${index}"]`)
    if (selectedBtn) {
      selectedBtn.classList.add('bg-gray-70', 'dark:bg-gray-800')
      selectedBtn.scrollIntoView({ block: 'nearest' })
    }
    }, [setSelectedIndex])

    // 修改showCommandMenu,设置isOpen状态
  const showCommandMenu = (blockEl: HTMLElement) => {
      console.log('\n=== 显示命令菜单 ===')
      console.log('当前Tippy状态:', {
          isShown: popupRef.current?.state.isShown,
          currentPlacement: popupRef.current?.props.placement,
          offset: popupRef.current?.props.offset,
      })

    currentBlockRef.current = blockEl
    const pos = editor.view.posAtDOM(blockEl, 0)
    const node = editor.view.state.doc.resolve(pos).parent
    const isEmpty = node.content.size === 0
    const originalRect = blockEl.getBoundingClientRect()

      console.log('块元素信息:', {
          isEmpty,
          position: pos,
          rect: {
              top: originalRect.top,
              bottom: originalRect.bottom,
              left: originalRect.left,
              height: originalRect.height,
          }
      })

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
            toJSON: () => {
            }
        }),
        placement: 'bottom-start',
          offset: [0, 10]
      })
    }

      if (!isEmpty) {
          console.log('处理非空块')
          editor.commands.enter()
          const newBlock = blockEl.nextElementSibling as HTMLElement
          const newRect = newBlock?.getBoundingClientRect() || originalRect
          updatePosition(newRect)
      } else {
          console.log('处理空块')
          updatePosition(originalRect)
      }

    requestAnimationFrame(() => {
      popupRef.current?.show()
        setIsOpen(true)
    })
  }

    // 监听selectedIndex变化，更新UI
    useEffect(() => {
        if (isOpen && selectedIndex >= 0) {
            console.log('更新UI高亮:', {selectedIndex})
            const buttons = menuRef.current?.querySelectorAll('button')
            if (!buttons) return

            buttons.forEach((btn) => btn.classList.remove('bg-gray-70', 'dark:bg-gray-800'))
            const selectedBtn = menuRef.current?.querySelector(`button[data-index="${selectedIndex}"]`)
            if (selectedBtn) {
                selectedBtn.classList.add('bg-gray-70', 'dark:bg-gray-800')
                selectedBtn.scrollIntoView({block: 'nearest'})
            }
        }
    }, [selectedIndex, isOpen])

  return null
}

export default BlockMenu
