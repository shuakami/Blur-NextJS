import dialogProcessor from '../core/DialogProcessor';
import PluginStateHandler from './PluginStateHandler';
import HistoryHandler from './HistoryHandler';

// 注册插件处理器
dialogProcessor.registerPlugin(PluginStateHandler);
dialogProcessor.registerPlugin(HistoryHandler);