import { Message } from '@/types/stream';


/**
 * 聊天状态接口
 * @interface ChatState
 * @description 管理聊天应用的全局状态
 */
export interface ChatState {
    /**
     * 聊天消息列表
     * @type {Message[]}
     * @description 存储当前对话中的所有消息记录，包括用户消息和AI回复
     * @example
     * messages: [{
     *   message_id: "msg_123",
     *   content: "你好~我是逆蝶(bushi",
     *   role: "user",
     *   created_at: "2024-011-7T10:00:00Z"
     * }]
     */
    messages: Message[];

    /**
     * 当前对话ID
     * @type {string | null}
     * @description 当前正在进行的对话的唯一标识符，null 表示没有活动对话
     */
    conversationId: string | null;

    /**
     * 新对话ID
     * @type {string | null}
     * @description 新创建的对话ID，用于处理对话创建过程中的状态
     */
    newConversationId: string | null;

    /**
     * 对话重载计数器
     * @type {number}
     * @description 用于触发对话列表重新加载的计数器，每次增加都会触发重新加载
     */
    reloadConversationsCounter: number;

    /**
     * 加载状态标志
     * @type {boolean}
     * @description 标识是否正在加载数据，用于显示加载动画或禁用交互
     */
    isLoading: boolean;

    /**
     * 更多数据标志
     * @type {boolean}
     * @description 标识是否还有更多历史消息可以加载
     */
    hasMore: boolean;

    /**
     * 消息偏移量
     * @type {number}
     * @description 分页加载时的消息偏移量，用于加载更多历史消息
     */
    offset: number;

    /**
     * 流式传输状态
     * @type {boolean}
     * @description 标识是否正在进行流式响应的接收
     */
    isStreaming: boolean;
}

/**
 * 聊天状态的初始值
 * @type {ChatState}
 * @description 定义聊天状态的初始值
 */
export const initialState: ChatState = {
    messages: [],
    conversationId: null,
    newConversationId: null,
    reloadConversationsCounter: 0,
    isLoading: false,
    hasMore: true,
    offset: 0,
    isStreaming: false,
};

/**
 * 聊天操作动作类型
 * @typedef {Object} Action
 * @description 定义所有可能的状态更新操作
 */
export type Action =
    /**
     * 设置对话ID动作
     * @description 更新当前活动对话的ID
     * @param {string | null} payload - 新的对话ID或null
     */
    | { type: 'SET_CONVERSATION_ID'; payload: string | null }

    /**
     * 添加单条消息动作
     * @description 向消息列表添加一条新消息
     * @param {Message} payload - 要添加的消息对象
     */
    | { type: 'ADD_MESSAGE'; payload: Message }

    /**
     * 批量添加消息动作
     * @description 向消息列表批量添加多条消息
     * @param {Message[]} payload - 要添加的消息数组
     */
    | { type: 'ADD_MESSAGES'; payload: Message[] }

    /**
     * 设置加载状态动作
     * @description 更新加载状态标志
     * @param {boolean} payload - 新的加载状态
     */
    | { type: 'SET_LOADING'; payload: boolean }

    /**
     * 设置更多数据标志动作
     * @description 更新是否还有更多数据可加载的标志
     * @param {boolean} payload - 是否还有更多数据
     */
    | { type: 'SET_HAS_MORE'; payload: boolean }

    /**
     * 设置偏移量动作
     * @description 更新消息加载的偏移量
     * @param {number} payload - 新的偏移量值
     */
    | { type: 'SET_OFFSET'; payload: number }

    /**
     * 设置流式传输状态动作
     * @description 更新流式传输的状态
     * @param {boolean} payload - 新的流式传输状态
     */
    | { type: 'SET_IS_STREAMING'; payload: boolean }

    /**
     * 增加重载计数器动作
     * @description 触发对话列表的重新加载
     */
    | { type: 'INCREMENT_RELOAD_COUNTER' }

    /**
     * 重置新对话ID动作
     * @description 清除新创建的对话ID
     */
    | { type: 'RESET_NEW_CONVERSATION_ID' }

    /**
     * 清空消息动作
     * @description 清空所有消息并重置相关状态
     */
    | { type: 'CLEAR_MESSAGES' }

    /**
     * 更新消息动作
     * @description 更新指定消息的内容
     * @param {Object} payload - 更新信息
     * @param {string} payload.message_id - 要更新的消息ID
     * @param {Partial<Message>} payload.updates - 要更新的消息字段
     */
    | { type: 'UPDATE_MESSAGE'; payload: { message_id: string | undefined; updates: Partial<Message> } };

/**
 * 聊天状态更新器
 * @function chatReducer
 * @description 处理所有聊天状态的更新操作
 * @param {ChatState} state - 当前状态
 * @param {Action} action - 要执行的动作
 * @returns {ChatState} 更新后的状态
 * @example
 * const [state, dispatch] = useReducer(chatReducer, initialState);
 * dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
 */
export const chatReducer = (state: ChatState, action: Action): ChatState => {
    switch (action.type) {
        case 'SET_CONVERSATION_ID':
            return { ...state, conversationId: action.payload };
        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'ADD_MESSAGES':
            return { ...state, messages: [...state.messages, ...action.payload] };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_HAS_MORE':
            return { ...state, hasMore: action.payload };
        case 'SET_OFFSET':
            return { ...state, offset: action.payload };
        case 'SET_IS_STREAMING':
            return { ...state, isStreaming: action.payload };
        case 'INCREMENT_RELOAD_COUNTER':
            return { ...state, reloadConversationsCounter: state.reloadConversationsCounter + 1 };
        case 'RESET_NEW_CONVERSATION_ID':
            return { ...state, newConversationId: null };
        case 'CLEAR_MESSAGES':
            return { ...state, messages: [], offset: 0, hasMore: true };
        case 'UPDATE_MESSAGE':
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg.message_id === action.payload.message_id ? { ...msg, ...action.payload.updates } : msg
                )
            };
        default:
            return state;
    }
};