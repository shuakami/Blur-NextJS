import { Extension } from '@tiptap/core'

const CustomBackspaceExtension = Extension.create({
  name: 'customBackspace',

  addStorage() {
    return {
      lastNodeState: null,
      lastProcessTime: 0,
      justConverted: false, // 标记是否刚完成转换
    }
  },

  addKeyboardShortcuts() {
    return {
      'Backspace': () => {
        // <防抖> 限制处理频率 50ms
        const now = Date.now()
        if (now - this.storage.lastProcessTime < 50) {
          return false
        }
        this.storage.lastProcessTime = now

        const { selection, doc } = this.editor.state
        const { empty, $anchor } = selection
        
        // 只处理光标在开始位置的情况
        if (!empty || $anchor.pos !== $anchor.start()) {
          this.storage.justConverted = false  // 重置转换状态
          return false
        }

        // 获取当前节点
        const node = $anchor.parent
        const currentNodeState = {
          type: node.type.name,
          isEmpty: node.content.size === 0,
          pos: $anchor.pos
        }

        // 如果刚完成过转换，这次就执行真正的退格
        if (this.storage.justConverted) {
          this.storage.justConverted = false
          return false // 使用默认的Backspace行为
        }

        // 如果节点为空且不是普通段落
        if (node.content.size === 0 && node.type.name !== 'paragraph') {
          // 只转换为普通段落，不执行退格
          this.editor.chain()
            .setNode('paragraph')
            .run()
          
          // 标记已完成转换
          this.storage.justConverted = true
          
          // 阻止默认的Backspace行为
          return true
        }

        // 其他情况使用默认行为
        return false
      }
    }
  }
})

export default CustomBackspaceExtension 