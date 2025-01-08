import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// 定义允许显示placeholder的节点类型
const ALLOWED_PLACEHOLDER_TYPES = ['paragraph', 'heading']

// 定义不允许其子节点显示placeholder的容器类型
const CONTAINER_BLACKLIST = ['bulletList', 'orderedList', 'taskList', 'codeBlock']

export const CustomPlaceholder = Extension.create({
  name: 'customPlaceholder',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('customPlaceholder'),
        props: {
          decorations: (state) => {
            const { doc, selection } = state
            const decorations: Decoration[] = []
            
            const currentNode = selection.$from.parent
            
            // 检查是否在黑名单容器内
            let isInBlacklistedContainer = false
            let depth = selection.$from.depth
            while (depth > 0) {
              const parent = selection.$from.node(depth)
              if (CONTAINER_BLACKLIST.includes(parent.type.name)) {
                isInBlacklistedContainer = true
                break
              }
              depth--
            }

            const shouldShowPlaceholder = 
              ALLOWED_PLACEHOLDER_TYPES.includes(currentNode.type.name) && 
              currentNode.content.size === 0 &&
              !currentNode.attrs.placeholder && // 确保节点没有自己的placeholder属性
              !isInBlacklistedContainer // 确保不在黑名单容器内

            if (shouldShowPlaceholder) {
              const placeholder = document.createElement('span')
              placeholder.className = 'absolute left-0 top-0 text-gray-400 dark:text-gray-300 pointer-events-none select-none'
              
              if (currentNode.type.name === 'heading') {
                const level = currentNode.attrs.level
                placeholder.textContent = `标题 ${level}`
              } else {
                placeholder.textContent = '按 "/" 输入命令'
              }

              const decoration = Decoration.widget(selection.from, placeholder, {
                side: -1
              })
              decorations.push(decoration)
            }

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
}) 