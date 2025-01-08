// SlashCommands.ts

import { Extension } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import { commands, CommandItem } from '../components/commands'

interface SuggestionProps {
  editor: Editor
  clientRect: () => DOMRect
  items: CommandItem[]
  command: (item: CommandItem) => void
  event?: KeyboardEvent
}

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor }: { editor: any }) => {
          editor
            .chain()
            .focus()
            .splitBlock()
            .setNode('heading', { level: 1 })
            .run()
          },
        items: ({ query }: { query: string }) => {
          return commands
            .filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10)
        },
        render: () => {
          let component: HTMLElement
          let popup: TippyInstance | null = null
          let selectedIndex = 0
          let currentItems: CommandItem[] = []
          let currentProps: SuggestionProps | null = null

          const selectItem = (index: number) => {
            const items = component.querySelectorAll('button')

            items.forEach(item => {
              item.classList.remove('bg-gray-70', 'dark:bg-gray-800')
            })

            const selectedItem = items[index]
            if (selectedItem) {
              selectedItem.classList.add('bg-gray-70', 'dark:bg-gray-800')
              selectedItem.scrollIntoView({ block: 'nearest' })
            }
            selectedIndex = index
          }

          const confirmSelection = () => {
            if (!currentProps) {
              return
            }
            const selectedItem = currentItems[selectedIndex]
            if (selectedItem) {
              currentProps.command(selectedItem)
              if (popup) {
                popup.hide()
              }
            }
          }

          return {
            onStart: (props: SuggestionProps) => {
              currentItems = props.items
              currentProps = props
              component = document.createElement('div')
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
                  <div class="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">添加内容</div>
                  ${props.items
                    .map(
                      (item: CommandItem, index: number) => `
                        <button class="group flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-70 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-80 dark:focus:bg-gray-800 ${
                          index === 0 ? 'bg-gray-70 dark:bg-gray-800' : ''
                        }">
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

              const buttons = component.querySelectorAll('button')
              buttons.forEach((button, index) => {
                button.addEventListener('click', () => {
                  selectItem(index)
                  confirmSelection()
                })

                button.addEventListener('mouseenter', () => {
                  selectItem(index)
                })
              })

              if (popup) {
                popup.destroy()
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              })[0]

              popup.show()
              selectItem(0)
            },

            onUpdate: (props: SuggestionProps) => {
              if (!props.items.length) {
                if (popup) {
                  popup.hide()
                }
                return
              }

              currentItems = props.items
              currentProps = props

              component.innerHTML = `
                <div class="space-y-0.5 max-h-[320px] overflow-y-auto overflow-x-hidden">
                  <div class="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">添加内容</div>
                  ${props.items
                    .map(
                      (item: CommandItem, index: number) => `
                        <button class="group flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-70 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-80 dark:focus:bg-gray-800 ${
                          index === 0 ? 'bg-gray-70 dark:bg-gray-800' : ''
                        }">
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

              const buttons = component.querySelectorAll('button')
              buttons.forEach((button, index) => {
                button.addEventListener('click', () => {
                  selectItem(index)
                  confirmSelection()
                })

                button.addEventListener('mouseenter', () => {
                  selectItem(index)
                })
              })

              if (popup) {
                popup.setContent(component)
                popup.show()
              } else {
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })[0]
                popup.show()
              }
              selectItem(0)
            },

            onKeyDown: (props: SuggestionProps) => {
              const event = props.event
              if (!event || !currentItems.length) {
                return false
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault()
                const newIndex = (selectedIndex - 1 + currentItems.length) % currentItems.length
                selectItem(newIndex)
                return true
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault()
                const newIndex = (selectedIndex + 1) % currentItems.length
                selectItem(newIndex)
                return true
              }

              if (event.key === 'Enter') {
                event.preventDefault()
                confirmSelection()
                return true
              }

              if (event.key === 'Escape') {
                event.preventDefault()
                if (popup) {
                  popup.hide()
                }
                return true
              }

              return false
            },

            onExit: () => {
              if (popup) {
                popup.destroy()
                popup = null
              }
              currentProps = null
              currentItems = []
            },
          }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    const editor = this.editor
    const options = this.options

    return [
      Suggestion({
        editor,
        ...options.suggestion,
      }),
    ]
  },
})
