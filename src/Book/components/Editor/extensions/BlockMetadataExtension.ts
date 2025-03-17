/**
 * BlockMetadataExtension - TipTap 编辑器的块级元数据扩展
 * 
 * 主要职责：
 * 1. 为块级节点（段落、标题等）添加和管理元数据
 * 2. 自动生成和更新节点属性（ID、时间戳等）
 * 3. 提供节点变更检测和批处理优化
 * 
 * 使用场景：
 * - 协同编辑：通过 blockId 追踪节点变更
 * - 版本控制：通过时间戳记录修改历史
 * - 性能优化：批量处理节点更新
 * 
 * @see {@link EditorCore} 编辑器核心组件
 */

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, EditorState, Transaction } from 'prosemirror-state'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Editor, RawCommands, CommandProps } from '@tiptap/core'
import { v4 as uuidv4 } from 'uuid'
import { Command } from '@tiptap/core'

/**
 * 属性类型定义
 * - uuid: 唯一标识符
 * - timestamp: 时间戳
 * - string: 字符串
 * - number: 数字
 */
type AttributeType = 'uuid' | 'timestamp' | 'string' | 'number'

/**
 * 属性规则配置
 * @property type - 属性类型
 * @property onCopy - 复制时的处理策略
 * @property autoUpdateOnChange - 是否在节点变更时自动更新
 * @property default - 默认值
 */
interface AttributeRule {
    type: AttributeType
    onCopy?: 'new' | 'keep'
    autoUpdateOnChange?: boolean
    default?: any
}

/**
 * 扩展配置选项
 * @property targetNodeTypes - 目标节点类型（数组或判断函数）
 * @property autoAttributes - 自动属性规则配置
 * @property onBlockCreated - 块创建回调
 * @property onBlockUpdated - 块更新回调
 */
export interface BlockMetadataOptions {
    targetNodeTypes: string[] | ((type: string) => boolean)
    autoAttributes?: Record<string, AttributeRule>
    onBlockCreated?: (blockId: string, node: ProseMirrorNode) => void
    onBlockUpdated?: (blockId: string, node: ProseMirrorNode) => void
}

/**
 * 块级元数据命令接口
 */
export interface BlockMetadataCommands {
    /**
     * 获取指定位置的块级 ID
     */
    getBlockIdAtPos: (pos: number) => (props: CommandProps) => string
    
    /**
     * 根据块级 ID 查找位置
     */
    findPosByBlockId: (blockId: string) => (props: CommandProps) => number
    
    /**
     * 设置块级属性
     */
    setBlockAttribute: (blockId: string, attrs: Record<string, any>) => Command
    
    /**
     * 移除块级属性
     */
    removeBlockAttribute: (blockId: string, attrName: string) => Command
    
    /**
     * 扫描所有块级节点
     */
    scanBlocks: (callback: (node: ProseMirrorNode, pos: number) => void) => Command
}

// 扩展 TipTap 命令类型
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        blockMetadata: BlockMetadataCommands
    }
}

/**
 * 默认配置
 * - 支持常见块级节点类型
 * - 提供基础元数据属性（blockId, createdAt, updatedAt）
 */
const defaultOptions: BlockMetadataOptions = {
    targetNodeTypes: (type: string) => ['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote'].includes(type),
    autoAttributes: {
        blockId: {
            type: 'uuid',
            onCopy: 'new',
        },
        createdAt: {
            type: 'timestamp',
            autoUpdateOnChange: false,
        },
        updatedAt: {
            type: 'timestamp',
            autoUpdateOnChange: true,
        },
    },
}

/**
 * 生成属性值
 * 根据属性规则生成对应类型的值
 * 
 * @param rule - 属性规则配置
 * @returns 生成的属性值
 */
const generateAttributeValue = (rule: AttributeRule): any => {
    switch (rule.type) {
        case 'uuid':
            return uuidv4()
        case 'timestamp':
            return Date.now()
        case 'string':
            return rule.default || ''
        case 'number':
            return rule.default || 0
        default:
            return rule.default
    }
}

/**
 * 检查节点是否需要处理
 * 根据目标节点类型配置判断节点是否需要添加元数据
 * 
 * @param node - ProseMirror 节点
 * @param targetNodeTypes - 目标节点类型配置
 * @returns 是否需要处理该节点
 */
const shouldProcessNode = (
    node: ProseMirrorNode,
    targetNodeTypes: BlockMetadataOptions['targetNodeTypes']
): boolean => {
    // 如果是函数，使用函数判断
    if (typeof targetNodeTypes === 'function') {
        return targetNodeTypes(node.type.name)
    }
    // 如果是数组，检查类型名称
    return Array.isArray(targetNodeTypes) && targetNodeTypes.includes(node.type.name)
}

/**
 * 检查节点是否被修改
 * 优化性能：按照开销从小到大的顺序检查
 * 
 * @param oldNode - 旧节点
 * @param newNode - 新节点
 * @returns 节点是否发生变化
 */
const isNodeChanged = (
    oldNode: ProseMirrorNode | null | undefined,
    newNode: ProseMirrorNode
): boolean => {
    if (!oldNode) return true
    // 先比较类型和标记(开销较小)
    if (!oldNode.sameMarkup(newNode)) return true
    // 最后比较文本(开销较大)
    return oldNode.textContent !== newNode.textContent
}

/**
 * 批量生成属性值
 * 根据规则为节点生成或更新属性
 * 
 * @param rules - 属性规则配置
 * @param existingAttrs - 现有属性
 * @param isNew - 是否是新节点
 * @returns 更新后的属性对象
 */
const generateAttributes = (
    rules: Record<string, AttributeRule>,
    existingAttrs: Record<string, any>,
    isNew: boolean
): Record<string, any> => {
    const attrs: Record<string, any> = { ...existingAttrs }
    let modified = false

    Object.entries(rules).forEach(([name, rule]) => {
        if (!attrs[name] || (rule.autoUpdateOnChange && !isNew)) {
            attrs[name] = generateAttributeValue(rule)
            modified = true
        }
    })

    return modified ? attrs : existingAttrs
}

/**
 * 块级元数据扩展
 * 为编辑器提供块级节点的元数据管理功能
 */
export const BlockMetadataExtension = Extension.create<BlockMetadataOptions>({
    name: 'blockMetadata',

    /**
     * 添加扩展选项
     * 设置默认的目标节点类型和属性规则
     */
    addOptions() {
        return {
            ...defaultOptions,
            targetNodeTypes: (type: string) => {
                const blockTypes = ['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote']
                return blockTypes.includes(type)
            }
        }
    },

    /**
     * 添加全局属性
     * 为目标节点类型添加元数据属性
     */
    addGlobalAttributes() {
        const attributes: Record<string, any> = {}
        
        Object.entries(this.options.autoAttributes || {}).forEach(([name, rule]) => {
            attributes[name] = {
                default: rule.default,
                parseHTML: (element: HTMLElement) => element.getAttribute(`data-${name}`),
                renderHTML: (attributes: Record<string, any>) => {
                    if (attributes[name]) {
                        return { [`data-${name}`]: attributes[name] }
                    }
                    return {}
                }
            }
        })

        return [{
            types: typeof this.options.targetNodeTypes === 'function' 
                ? ['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote']
                : this.options.targetNodeTypes || [],
            attributes,
        }]
    },

    /**
     * 添加 ProseMirror 插件
     * 处理节点变更和属性更新
     */
    addProseMirrorPlugins() {
        const extension = this
        const pluginKey = new PluginKey('blockMetadata')
        
        // 用于缓存节点状态
        const nodeCache = new WeakMap<ProseMirrorNode, {
            attrs: Record<string, any>
            lastCheck: number
        }>();

        return [
            new Plugin({
                key: pluginKey,

                /**
                 * 追加事务
                 * 处理文档变更，更新节点属性
                 */
                appendTransaction(transactions, oldState, newState) {
                    // 如果文档没有改变，不需要处理
                    if (!transactions.some(tr => tr.docChanged)) {
                        return null
                    }

                    const tr = newState.tr
                    let modified = false
                    const processedNodes = new Set<string>() // 避免重复处理
                    const batchSize = 100 // 批处理大小
                    let batchCount = 0

                    try {
                        // 获取改变的位置范围
                        const changes = new Set<number>()
                        transactions.forEach(transaction => {
                            transaction.steps.forEach((step, index) => {
                                const map = transaction.mapping.maps[index]
                                map.forEach((oldStart, oldEnd, newStart, newEnd) => {
                                    for (let pos = newStart; pos < newEnd; pos++) {
                                        changes.add(pos)
                                    }
                                })
                            })
                        })

                        // 只处理发生改变的节点
                        newState.doc.descendants((node, pos) => {
                            // 如果达到批处理限制，跳过剩余节点
                            if (batchCount >= batchSize) return false

                            // 如果位置没有改变，跳过
                            if (!changes.has(pos) && !changes.has(pos - 1) && !changes.has(pos + 1)) {
                                return true
                            }

                            // 检查是否需要处理此节点
                            if (!shouldProcessNode(node, extension.options.targetNodeTypes)) {
                                return true
                            }

                            // 确保位置有效
                            if (pos < 0 || pos >= newState.doc.content.size) return false

                            const nodeId = node.attrs.blockId
                            if (nodeId && processedNodes.has(nodeId)) return true
                            
                            // 获取旧节点
                            let oldNode = null
                            try {
                                if (pos < oldState.doc.content.size) {
                                    oldNode = oldState.doc.nodeAt(pos)
                                }
                            } catch (err: unknown) {
                                return true
                            }

                            // 检查是否真的改变
                            const hasChanged = isNodeChanged(oldNode, node)
                            if (!hasChanged && nodeId) return true

                            // 生成/更新属性
                            const newAttrs = generateAttributes(
                                extension.options.autoAttributes || {},
                                node.attrs,
                                !oldNode
                            )

                            // 如果属性有更新
                            if (newAttrs !== node.attrs) {
                                try {
                                    tr.setNodeMarkup(pos, undefined, newAttrs)
                                    modified = true
                                    batchCount++

                                    // 只在真正创建或更新时触发回调和日志
                                    if (newAttrs.blockId) {
                                        if (!oldNode) {
                                            extension.options.onBlockCreated?.(newAttrs.blockId, node)
                                        } else {
                                            extension.options.onBlockUpdated?.(newAttrs.blockId, node)
                                        }
                                    }

                                    if (nodeId) {
                                        processedNodes.add(nodeId)
                                    }
                                } catch (err: unknown) {
                                    const error = err instanceof Error ? err.message : String(err)
                                    console.error('[BlockMetadata] 更新失败:', { blockId: nodeId, error })
                                }
                            }

                            return true
                        })
                    } catch (err: unknown) {
                        const error = err instanceof Error ? err.message : String(err)
                        console.error('[BlockMetadata] 处理失败:', error)
                        return null
                    }

                    return modified ? tr : null
                },

                /**
                 * 过滤事务
                 * 防止无效的属性更新
                 */
                filterTransaction(tr, state) {
                    if (!tr.docChanged) return true

                    let modified = false
                    const newTr = state.tr
                    const processedNodes = new Set<string>()

                    try {
                        tr.steps.forEach((step, index) => {
                            const doc = tr.docs[index]
                            if (!doc) return

                            const map = tr.mapping.maps[index]
                            if (!map) return

                            map.forEach((oldStart, oldEnd, newStart, newEnd) => {
                                if (typeof newStart !== 'number' || typeof newEnd !== 'number' ||
                                    newStart < 0 || newEnd > doc.content.size) return

                                doc.nodesBetween(newStart, newEnd, (node, pos) => {
                                    if (!shouldProcessNode(node, extension.options.targetNodeTypes)) {
                                        return true
                                    }

                                    const nodeId = node.attrs.blockId
                                    if (nodeId && processedNodes.has(nodeId)) return true

                                    const newAttrs = generateAttributes(
                                        extension.options.autoAttributes || {},
                                        node.attrs,
                                        true
                                    )

                                    if (newAttrs !== node.attrs && pos >= 0 && pos < doc.content.size) {
                                        try {
                                            newTr.setNodeMarkup(pos, undefined, newAttrs)
                                            modified = true
                                            if (nodeId) {
                                                processedNodes.add(nodeId)
                                            }
                                        } catch (err: unknown) {
                                            const error = err instanceof Error ? err.message : String(err)
                                            console.error('[BlockMetadata] 复制失败:', { blockId: nodeId, error })
                                        }
                                    }

                                    return true
                                })
                            })
                        })
                    } catch (err: unknown) {
                        const error = err instanceof Error ? err.message : String(err)
                        console.error('[BlockMetadata] 处理复制粘贴失败:', error)
                    }

                    return true
                },
            }),
        ]
    },

    /**
     * 添加命令
     * 提供块级元数据操作的命令
     */
    addCommands() {
        return {
            getBlockIdAtPos: (pos: number) => ({ state }: CommandProps): string => {
                const node = state.doc.nodeAt(pos)
                return node?.attrs.id || ''
            },

            findPosByBlockId: (blockId: string) => ({ state }: CommandProps): number => {
                let foundPos = -1
                state.doc.descendants((node, pos) => {
                    if (node.attrs.id === blockId) {
                        foundPos = pos
                        return false
                    }
                    return true
                })
                return foundPos
            },

            setBlockAttribute: (blockId: string, attrs: Record<string, any>) => 
                ({ tr, state }: CommandProps): boolean => {
                    let modified = false
                    state.doc.descendants((node, pos) => {
                        if (node.attrs.id === blockId) {
                            tr.setNodeMarkup(pos, null, {
                                ...node.attrs,
                                ...attrs
                            })
                            modified = true
                            return false
                        }
                        return true
                    })
                    return modified
                },

            removeBlockAttribute: (blockId: string, attrName: string) => 
                ({ tr, state }: CommandProps): boolean => {
                    let modified = false
                    state.doc.descendants((node, pos) => {
                        if (node.attrs.id === blockId) {
                            const newAttrs = { ...node.attrs }
                            delete newAttrs[attrName]
                            tr.setNodeMarkup(pos, null, newAttrs)
                            modified = true
                            return false
                        }
                        return true
                    })
                    return modified
                },

            scanBlocks: (callback: (node: ProseMirrorNode, pos: number) => void) => 
                ({ state }: CommandProps): boolean => {
                    let scanned = false
                    state.doc.descendants((node, pos) => {
                        if (shouldProcessNode(node, this.options.targetNodeTypes)) {
                            callback(node, pos)
                            scanned = true
                        }
                        return true
                    })
                    return scanned
                }
        } as Partial<BlockMetadataCommands>
    },
}) 