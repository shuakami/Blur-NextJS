import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Node as ProseMirrorNode } from 'prosemirror-model'

// 引入拖拽样式
import './dragHandle.css'

export interface DragHandleOptions {
  dragHandleWidth?: number
}

interface DraggingState {
  blockId: string               // 标识拖拽块
  sourceNode: ProseMirrorNode   // 源节点
  domNode: HTMLElement          // 源节点DOM
  clone?: HTMLElement           // 用来拖拽预览
  indicator?: HTMLElement       // 用于显示目标位置指示线
  finalPos?: number             // 计算得到的插入位置
}

export const DragHandleExtension = Extension.create<DragHandleOptions>({
  name: 'dragHandle',

  addOptions() {
    return {
      dragHandleWidth: 22,
    }
  },

  addProseMirrorPlugins() {
    let dragging: DraggingState | null = null

    /**
     * 创建拖拽预览
     */
    const createDragPreview = (node: HTMLElement) => {
      const clone = node.cloneNode(true) as HTMLElement
      clone.classList.add('drag-preview')
      document.body.appendChild(clone)
      return clone
    }

    /**
     * 创建位置指示线
     */
    const createPositionIndicator = () => {
      const indicator = document.createElement('div')
      indicator.classList.add('drag-indicator')
      document.body.appendChild(indicator)
      return indicator
    }

    /**
     * 更新拖拽预览位置
     */
    const updateDragPreview = (event: MouseEvent, clone: HTMLElement) => {
      requestAnimationFrame(() => {
        // 在鼠标右侧偏移20px显示
        clone.style.left = `${event.clientX + 20}px`
        // 垂直方向保持与鼠标对齐，但稍微往上偏移以对齐块的中心
        clone.style.top = `${event.clientY - clone.offsetHeight / 2}px`
      })
    }

    /**
     * 更新插入位置指示线
     */
    const updatePositionIndicator = (view: EditorView, pos: number, indicator: HTMLElement) => {
      requestAnimationFrame(() => {
        const coords = view.coordsAtPos(pos)
        
        // 获取编辑器容器
        const editorContainer = view.dom.closest('.relative.min-h-\\[200px\\]') as HTMLElement
        if (!editorContainer) return
        
        // 获取实际内容区域
        const contentContainer = editorContainer.querySelector('.min-h-\\[150px\\]') as HTMLElement
        if (!contentContainer) return

        const contentRect = contentContainer.getBoundingClientRect()
        
        indicator.style.top = `${coords.top - 8}px`
        indicator.style.left = `${contentRect.left}px`
        indicator.style.width = `${contentRect.width}px`
        indicator.style.opacity = '1'
      })
    }

    /**
     * 清理拖拽状态
     */
    const cleanupDragging = () => {
      if (!dragging) return
      const { domNode, clone, indicator } = dragging
      clone?.remove()
      indicator?.remove()
      domNode.classList.remove('is-dragging')
      document.querySelector('.ProseMirror')?.classList.remove('dragging')
      document.body.style.cursor = ''
      dragging = null
    }

    /**
     * 判断是否点在把手区域
     */
    const isInDragHandleZone = (event: MouseEvent, blockEl: HTMLElement): boolean => {
      const rect = blockEl.getBoundingClientRect()
      const offsetX = event.clientX - rect.left
      const dragHandleWidth = this.options.dragHandleWidth ?? 22
      return offsetX > -dragHandleWidth && offsetX <= 0
    }

    /**
     * 找到可拖拽的块节点
     */
    const findValidBlockNode = (view: EditorView, blockEl: HTMLElement) => {
      const pos = view.posAtDOM(blockEl, 0)
      if (pos === null) return null

      const $pos = view.state.doc.resolve(pos)
      let depth = $pos.depth
      while (depth >= 0) {
        const node = $pos.node(depth)
        if (['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote'].includes(node.type.name)) {
          return node
        }
        depth--
      }
      return null
    }

    /**
     * 核心：只认 "块后方" 作为插入点
     * 并对空段落单独处理 => 也插到它后方 (模拟 Notion：只有一条线在空行下面)
     */
    const findBlockBoundary = (view: EditorView, rawPos: number): number => {
      const doc = view.state.doc
      if (rawPos <= 0) return 0
      if (rawPos >= doc.content.size) return doc.content.size

      const $raw = doc.resolve(rawPos)

      // 如果父节点本身是空段落
      if (
        $raw.parent.type.name === 'paragraph' &&
        $raw.parent.content.size === 0
      ) {
        // 检查是否是第一个块
        if ($raw.before($raw.depth) === 0) {
          // 是第一个块,返回0作为插入位置
          return 0
        }
        // 不是第一个块,返回after位置
        return $raw.after($raw.depth)
      }

      // 如果这个位置在块的首/末 => 也直接用 after
      return $raw.after($raw.depth)
    }

    /**
     * 拖拽开始
     */
    const handleDragStart = (view: EditorView, event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement
        let blockEl = target.closest('.ProseMirror-node') as HTMLElement
        if (!blockEl) {
          blockEl = target.closest('p, h1, h2, h3, ul, ol, li, blockquote') as HTMLElement
        }
        if (!blockEl) {
          blockEl = target.closest('.ProseMirror > *') as HTMLElement
        }
        if (!blockEl) {
          console.log('[DragHandle] [START] 未找到有效块元素')
          return false
        }

        if (!isInDragHandleZone(event, blockEl)) {
          return false
        }

        const node = findValidBlockNode(view, blockEl)
        if (!node) {
          console.log('[DragHandle] [START] 块节点无效')
          return false
        }
        if (!node.attrs.blockId) {
          console.log('[DragHandle] [START] 块节点缺少 blockId')
          return false
        }

        const clone = createDragPreview(blockEl)
        const indicator = createPositionIndicator()

        dragging = {
          blockId: node.attrs.blockId,
          sourceNode: node,
          domNode: blockEl,
          clone,
          indicator,
        }

        // 添加拖动状态类
        blockEl.classList.add('is-dragging')
        view.dom.classList.add('dragging')
        document.body.style.cursor = 'grabbing'
        
        // 防止文本选择
        event.preventDefault()
        
        updateDragPreview(event, clone)

        console.log('[DragHandle] [START] 拖拽状态设置完成 blockId=', node.attrs.blockId)
        return true
      } catch (err) {
        cleanupDragging()
        console.warn('[DragHandle] [START] 拖拽开始失败:', err)
      }
      return false
    }

    /**
     * 拖拽移动
     */
    const handleDrag = (view: EditorView, event: MouseEvent) => {
      if (!dragging?.clone || !dragging.indicator) {
        return false
      }
      try {
        updateDragPreview(event, dragging.clone)

        const posInfo = view.posAtCoords({ left: event.clientX, top: event.clientY })
        const docSize = view.state.doc.content.size

        let newPos: number | undefined = posInfo?.pos

        // 若 posAtCoords=null => 可能鼠标在编辑器外
        if (posInfo == null) {
          // 隐藏指示线并返回
          dragging.finalPos = undefined
          dragging.indicator.style.opacity = '0'
          return true
        }

        // 钳制
        if (typeof newPos === 'number') {
          // 只检查文档结尾,允许位置0
          if (newPos >= docSize) {
            dragging.finalPos = undefined
            dragging.indicator.style.opacity = '0'
            return true
          }
        } else {
          // 仍然 undefined => 隐藏指示线
          dragging.finalPos = undefined
          dragging.indicator.style.opacity = '0'
          return true
        }

        // 只认块后方
        try {
          const alignedPos = findBlockBoundary(view, newPos)
          
          // 只检查文档结尾,允许位置0
          if (alignedPos >= docSize) {
            dragging.finalPos = undefined
            dragging.indicator.style.opacity = '0'
            return true
          }

          // 找到源节点位置
          let sourcePos: number | undefined
          view.state.doc.descendants((node, pos) => {
            if (node.attrs?.blockId === dragging?.blockId) {
              sourcePos = pos
              return false
            }
            return true
          })

          // 收集所有可能的插入点
          let validPositions: number[] = []
          let currentNode: ProseMirrorNode | null = null
          let currentPos = 0

          view.state.doc.descendants((node, pos) => {
            if (['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote'].includes(node.type.name)) {
              currentNode = node
              currentPos = pos
              const afterPos = pos + node.nodeSize
              // 不包含源节点位置
              if (afterPos !== sourcePos) {
                validPositions.push(afterPos)
              }
            }
            return true
          })

          // 如果当前位置不可用（是源节点位置），找最近的可用位置
          if (sourcePos !== undefined && alignedPos === sourcePos) {
            // 计算到每个可用位置的距离
            const currentY = event.clientY
            const distances = validPositions.map(pos => {
              const coords = view.coordsAtPos(pos)
              return {
                pos,
                distance: Math.abs(coords.top - currentY)
              }
            })

            // 按距离排序
            distances.sort((a, b) => a.distance - b.distance)

            // 使用最近的位置,如果没有其他可用位置,就使用alignedPos
            if (distances.length > 0) {
              const nearestPos = distances[0].pos
              dragging.finalPos = nearestPos
              updatePositionIndicator(view, nearestPos, dragging.indicator)
              console.log('[DragHandle] [MOVE] 使用最近的可用位置:', nearestPos)
            } else {
              // 没有其他可用位置,使用当前对齐位置
              dragging.finalPos = alignedPos
              updatePositionIndicator(view, alignedPos, dragging.indicator)
              console.log('[DragHandle] [MOVE] 无其他可用位置,使用当前位置:', alignedPos)
            }
            return true
          }

          // 当前位置可用，直接使用
          if (dragging.finalPos !== alignedPos) {
            dragging.finalPos = alignedPos
            updatePositionIndicator(view, alignedPos, dragging.indicator)
            console.log('[DragHandle] [MOVE] 对齐后 finalPos:', alignedPos)
          }
        } catch (err) {
          // 如果 findBlockBoundary 失败，隐藏指示线
          dragging.finalPos = undefined
          dragging.indicator.style.opacity = '0'
          return true
        }

        return true
      } catch (err) {
        console.warn('[DragHandle] [MOVE] 拖拽移动失败:', err)
        // 发生错误时也隐藏指示线
        if (dragging?.indicator) {
          dragging.finalPos = undefined
          dragging.indicator.style.opacity = '0'
        }
        return false
      }
    }

    /**
     * 拖拽结束
     */
    const handleDragEnd = (view: EditorView) => {
      if (!dragging) {
        console.log('[DragHandle] [END] 拖拽状态无效')
        return false
      }
      try {
        const { blockId, sourceNode, finalPos } = dragging
        console.log('[DragHandle] [END] 拖拽结束, 准备移动 =>', {
          blockId,
          finalPos,
          sourceNodeType: sourceNode.type.name,
          nodeSize: sourceNode.nodeSize,
        })

        if (typeof finalPos !== 'number') {
          console.log('[DragHandle] [END] 未计算出有效 finalPos, 放弃移动')
          return false
        }

        // 找到源节点位置
        let foundPos: number | undefined
        view.state.doc.descendants((node, pos) => {
          if (node.attrs?.blockId === blockId) {
            foundPos = pos
            return false
          }
          return true
        })
        if (foundPos == null) {
          console.warn('[DragHandle] [END] 找不到源节点 foundPos')
          return false
        }

        // 若 finalPos == foundPos => 不移动
        if (finalPos === foundPos) {
          console.log('[DragHandle] [END] finalPos == foundPos, 不移动')
          return false
        }

        const tr = view.state.tr
        const nodeSize = sourceNode.nodeSize
        let insertPos = finalPos

        // 如果插入位置在删除位置之后，需要先 -nodeSize
        if (insertPos > foundPos) {
          insertPos -= nodeSize
        }

        console.log(
          `[DragHandle] [END] 准备执行 delete(${foundPos}, ${foundPos + nodeSize}), insert(${insertPos})`
        )

        tr.delete(foundPos, foundPos + nodeSize)
        tr.insert(insertPos, sourceNode)

        if (tr.docChanged) {
          console.log('[DragHandle] [END] docChanged=true, dispatch...')
          view.dispatch(tr)
          console.log('[DragHandle] [END] 已 dispatch, 应见 UI 变化')
        } else {
          console.log('[DragHandle] [END] docChanged=false, 无变动')
        }
      } catch (err) {
        console.error('[DragHandle] [END] 拖拽结束异常:', err)
      } finally {
        cleanupDragging()
        console.log('[DragHandle] [END] 拖拽状态已清理')
      }
      return true
    }

    /**
     * 返回 Plugin
     */
    return [
      new Plugin({
        key: new PluginKey('dragHandle'),
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => handleDragStart(view, event),
            mousemove: (view, event) => {
              if (dragging) {
                event.preventDefault()
                return handleDrag(view, event)
              }
              return false
            },
            mouseup: (view) => {
              if (dragging) {
                return handleDragEnd(view)
              }
              return false
            },
          },
        },
      }),
    ]
  },
})
