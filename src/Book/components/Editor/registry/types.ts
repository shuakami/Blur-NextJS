import { Editor, Extension } from '@tiptap/core';

/**
 * 块配置接口
 * 定义一个编辑器块的所有必要信息
 */
export interface BlockConfig {
  /** 块的唯一标识符 */
  id: string;
  
  /** 块的类型名称 */
  type: string;
  
  /** 在UI中显示的标题 */
  title: string;
  
  /** 块的描述信息 */
  description: string;
  
  /** 在菜单中显示的图标 (SVG) */
  icon: string;
  
  /** 关联的 TipTap 扩展 */
  extension?: Extension;
  
  /** 块的自定义属性 */
  attributes?: Record<string, any>;
  
  /** 
   * 创建块的命令
   * @param editor TipTap 编辑器实例
   */
  command: (editor: Editor) => void;
}

/**
 * 命令项接口
 * 用于菜单显示和命令执行
 */
export interface CommandItem {
  /** 命令标题 */
  title: string;
  
  /** 命令描述 */
  description: string;
  
  /** 命令图标 */
  icon: string;
  
  /** 
   * 执行命令的函数
   * @param params 包含编辑器实例和可选的范围信息
   */
  command: (params: { editor: Editor; range?: any }) => void;
}

/**
 * 注册表事件类型
 */
export type RegistryEventType = 
  | 'block:registered'   // 块注册事件
  | 'block:unregistered' // 块注销事件
  | 'registry:cleared';  // 注册表清空事件

/**
 * 注册表事件处理器
 */
export type RegistryEventHandler = (blockId: string) => void;

/**
 * 注册表选项
 */
export interface RegistryOptions {
  /** 是否启用事件系统 */
  enableEvents?: boolean;
  
  /** 是否允许覆盖已存在的块 */
  allowOverride?: boolean;
} 