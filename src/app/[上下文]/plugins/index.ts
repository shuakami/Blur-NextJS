import dialogProcessor from '../core/DialogProcessor';
import PluginStateHandler from './PluginStateHandler';
import HistoryPluginHandler from './HistoryPluginHandler';

// 注册插件处理器
dialogProcessor.registerPlugin(PluginStateHandler);
dialogProcessor.registerPlugin(HistoryPluginHandler);