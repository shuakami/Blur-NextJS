// commands.ts

import { BlockRegistry } from '../registry/BlockRegistry';
import { CommandItem } from '../registry/types';
import { registerDefaultBlocks } from '../registry/defaultBlocks';

// 获取注册表实例
const registry = BlockRegistry.getInstance();

// 注册默认块
registerDefaultBlocks(registry);

// 导出命令列表
export const commands: CommandItem[] = registry.getCommands();

// 为了向后兼容,保留 CommandItem 类型导出
export type { CommandItem } from '../registry/types';
