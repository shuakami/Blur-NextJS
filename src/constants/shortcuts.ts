/**
 * 定义快捷键常量
 * @constant {Object} SHORTCUTS - 包含应用程序中使用的快捷键
 * @property {string} TOGGLE_SIDEBAR - 切换侧边栏的快捷键
 * @property {string} NEW_CHAT - 新建会话的快捷键
 * @property {string} DELETE_CHAT - 删除会话的快捷键
 * @property {string} PREV_CHAT - 上一个对话的快捷键
 * @property {string} NEXT_CHAT - 下一个对话的快捷键
 * @property {string} TOGGLE_MODEL - 切换模型的快捷键
 * @property {string} FOCUS_CHAT - 聚焦聊天输入的快捷键
 * @property {string} TOGGLE_COMMAND_CENTER - 打开命令中心的快捷键
 */
export const SHORTCUTS = {
    TOGGLE_SIDEBAR: 'Ctrl+B',
    NEW_CHAT: 'Alt+N',
    DELETE_CHAT: 'alt+del',
    PREV_CHAT: 'ctrl+up',
    NEXT_CHAT: 'ctrl+down',
    TOGGLE_MODEL: 'alt+m',
    FOCUS_CHAT: '/',
    TOGGLE_COMMAND_CENTER: 'Shift+Shift'
} as const;

/**
 * 定义快捷键描述常量
 * @constant {Object} SHORTCUT_DESCRIPTIONS - 包含每个快捷键的描述
 * @property {string} TOGGLE_SIDEBAR - 侧边栏开启/关闭的描述
 * @property {string} NEW_CHAT - 新建会话的描述
 * @property {string} DELETE_CHAT - 删除会话的描述
 * @property {string} PREV_CHAT - 上一个对话的描述
 * @property {string} NEXT_CHAT - 下一个对话的描述
 * @property {string} TOGGLE_MODEL - 切换模型的描述
 * @property {string} FOCUS_CHAT - 聚焦聊天输入的描述
 * @property {string} TOGGLE_COMMAND_CENTER - 打开命令中心的描述
 */
export const SHORTCUT_DESCRIPTIONS = {
    TOGGLE_SIDEBAR: '侧边栏开启/关闭',
    NEW_CHAT: '新建会话',
    DELETE_CHAT: '删除当前会话',
    PREV_CHAT: '上一个对话',
    NEXT_CHAT: '下一个对话',
    TOGGLE_MODEL: '切换模型',
    FOCUS_CHAT: '聚焦聊天输入',
    TOGGLE_COMMAND_CENTER: '打开命令中心'
} as const;