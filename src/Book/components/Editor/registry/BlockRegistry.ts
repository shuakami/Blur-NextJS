import { Extension } from '@tiptap/core';
import { 
  BlockConfig, 
  CommandItem, 
  RegistryEventType,
  RegistryEventHandler,
  RegistryOptions
} from './types';

/**
 * 块注册表
 * 管理编辑器中所有可用的块类型
 */
export class BlockRegistry {
  private static instance: BlockRegistry;
  private blocks: Map<string, BlockConfig>;
  private extensions: Set<Extension>;
  private eventHandlers: Map<RegistryEventType, Set<RegistryEventHandler>>;
  private options: Required<RegistryOptions>;

  private constructor(options: RegistryOptions = {}) {
    this.blocks = new Map();
    this.extensions = new Set();
    this.eventHandlers = new Map();
    this.options = {
      enableEvents: options.enableEvents ?? true,
      allowOverride: options.allowOverride ?? false
    };
  }

  /**
   * 获取单例实例
   */
  static getInstance(options?: RegistryOptions): BlockRegistry {
    if (!BlockRegistry.instance) {
      BlockRegistry.instance = new BlockRegistry(options);
    }
    return BlockRegistry.instance;
  }

  /**
   * 注册新的块类型
   * @param config 块配置
   * @throws 如果块ID已存在且不允许覆盖
   */
  register(config: BlockConfig): void {
    if (this.blocks.has(config.id) && !this.options.allowOverride) {
      throw new Error(`Block with id "${config.id}" already exists`);
    }

    // 注册块配置
    this.blocks.set(config.id, config);
    
    // 如果有扩展,注册扩展
    if (config.extension) {
      this.extensions.add(config.extension);
    }

    // 触发注册事件
    this.emit('block:registered', config.id);
  }

  /**
   * 注销块类型
   * @param blockId 块ID
   */
  unregister(blockId: string): void {
    const block = this.blocks.get(blockId);
    if (block) {
      this.blocks.delete(blockId);
      if (block.extension) {
        this.extensions.delete(block.extension);
      }
      this.emit('block:unregistered', blockId);
    }
  }

  /**
   * 获取指定块的配置
   * @param blockId 块ID
   */
  getBlock(blockId: string): BlockConfig | undefined {
    return this.blocks.get(blockId);
  }

  /**
   * 获取所有已注册的块
   */
  getBlocks(): BlockConfig[] {
    return Array.from(this.blocks.values());
  }

  /**
   * 获取所有扩展
   */
  getExtensions(): Extension[] {
    return Array.from(this.extensions);
  }

  /**
   * 获取所有命令
   */
  getCommands(): CommandItem[] {
    return this.getBlocks().map(block => ({
      title: block.title,
      description: block.description,
      icon: block.icon,
      command: ({ editor }) => block.command(editor)
    }));
  }

  /**
   * 检查块是否已注册
   * @param blockId 块ID
   */
  hasBlock(blockId: string): boolean {
    return this.blocks.has(blockId);
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.blocks.clear();
    this.extensions.clear();
    this.emit('registry:cleared', '');
  }

  /**
   * 注册事件处理器
   * @param event 事件类型
   * @param handler 处理函数
   */
  on(event: RegistryEventType, handler: RegistryEventHandler): void {
    if (!this.options.enableEvents) return;

    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler);
  }

  /**
   * 注销事件处理器
   * @param event 事件类型
   * @param handler 处理函数
   */
  off(event: RegistryEventType, handler: RegistryEventHandler): void {
    if (!this.options.enableEvents) return;
    
    this.eventHandlers.get(event)?.delete(handler);
  }

  /**
   * 触发事件
   * @param event 事件类型
   * @param blockId 相关块ID
   */
  private emit(event: RegistryEventType, blockId: string): void {
    if (!this.options.enableEvents) return;

    this.eventHandlers.get(event)?.forEach(handler => {
      try {
        handler(blockId);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  }
} 