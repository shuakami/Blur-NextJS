import { Message, MessageStatus } from '@/types/stream';
import { v4 as uuidv4 } from 'uuid';

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
     * @description 更新指定消息的内容和状态
     * @param {Object} payload - 更新信息
     * @param {string} payload.message_id - 要更新的消息ID
     * @param {Partial<Message & { sendStatus?: MessageStatus }>} payload.updates - 要更新的消息字段
     */
    | { 
        type: 'UPDATE_MESSAGE'; 
        payload: { 
            message_id: string | undefined; 
            updates: Partial<Message & { 
                sendStatus?: MessageStatus;
                retryCount?: number;
            }> 
        } 
    }

    /**
     * 设置新对话ID动作
     * @description 设置新创建的对话ID
     * @param {string} payload - 新的对话ID
     */
    | { type: 'SET_NEW_CONVERSATION_ID'; payload: string }

    /**
     * 清除失败消息动作
     * @description 清除失败的消息
     * @param {Object} payload - 清除信息
     * @param {string} payload.userMessageId - 用户消息ID
     * @param {string} payload.botMessageId - 机器人消息ID
     */
    | { 
        type: 'CLEAR_FAILED_MESSAGES'; 
        payload: {
            userMessageId?: string;
            botMessageId?: string;
        }
    };

/**
 * 聊天状态更新器
 * @function chatReducer
 * @description 处理所有聊天状态的更新操作，包括添加消息、更新消息、设置加载状态等。
 * @param {ChatState} state - 当前的聊天状态，包含消息列表、对话ID等信息。
 * @param {Action} action - 要执行的动作，包含类型和相关的负载数据。
 * @returns {ChatState} 更新后的聊天状态。
 * @example
 * const [state, dispatch] = useReducer(chatReducer, initialState);
 * dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
 */
export const chatReducer = (state: ChatState, action: Action): ChatState => {
    switch (action.type) {
        /**
         * 设置对话ID
         * @param {string} action.payload - 新的对话ID，用于标识当前对话。
         * @returns {ChatState} 更新后的状态，包含新的对话ID。
         */
        case 'SET_CONVERSATION_ID':
            return { ...state, conversationId: action.payload };

        /**
         * 添加单条消息
         * @param {Message} action.payload - 要添加的消息对象（带自动修补），包含消息内容和发送者信息。
         * @returns {ChatState} 更新后的状态，包含新的消息列表。
         */
        case 'ADD_MESSAGE': {
            const messageWithId = {
                ...action.payload,
                message_id: action.payload.message_id || uuidv4()
            };
            return { ...state, messages: [...state.messages, messageWithId] };
        }

        /**
         * 添加多条消息
         * @param {Message[]} action.payload - 要添加的消息数组（带自动修补），包含多条消息对象。
         * @returns {ChatState} 更新后的状态，包含新的消息列表。
         */
        case 'ADD_MESSAGES': {
            const messagesWithIds = action.payload.map(msg => ({
                ...msg,
                message_id: msg.message_id || uuidv4()
            }));
            return { ...state, messages: [...state.messages, ...messagesWithIds] };
        }

        /**
         * 设置加载状态
         * @param {boolean} action.payload - 加载状态，指示是否正在加载数据。
         * @returns {ChatState} 更新后的状态，包含新的加载状态。
         */
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        /**
         * 设置是否还有更多数据
         * @param {boolean} action.payload - 是否还有更多数据可加载。
         * @returns {ChatState} 更新后的状态，包含新的更多数据标志。
         */
        case 'SET_HAS_MORE':
            return { ...state, hasMore: action.payload };

        /**
         * 设置消息偏移量
         * @param {number} action.payload - 新的消息偏移量，用于分页加载更多消息。
         * @returns {ChatState} 更新后的状态，包含新的偏移量。
         */
        case 'SET_OFFSET':
            return { ...state, offset: action.payload };

        /**
         * 设置流式传输状态
         * @param {boolean} action.payload - 新的流式传输状态，指示是否正在进行流式响应。
         * @returns {ChatState} 更新后的状态，包含新的流式传输状态。
         */
        case 'SET_IS_STREAMING':
            return { ...state, isStreaming: action.payload };

        /**
         * 增加重载计数器
         * @description 触发对话列表的重新加载，每次调用此动作都会增加计数器。
         * @returns {ChatState} 更新后的状态，包含新的重载计数器值。
         */
        case 'INCREMENT_RELOAD_COUNTER':
            return { ...state, reloadConversationsCounter: state.reloadConversationsCounter + 1 };

        /**
         * 重置新对话ID
         * @description 清除新创建的对话ID，将其设置为null。
         * @returns {ChatState} 更新后的状态，包含重置后的新对话ID。
         */
        case 'RESET_NEW_CONVERSATION_ID':
            return { ...state, newConversationId: null };

        /**
         * 清空所有消息
         * @description 清空消息列表并重置相关状态，包括偏移量和更多数据标志。
         * @returns {ChatState} 更新后的状态，包含空的消息列表和重置的状态。
         */
        case 'CLEAR_MESSAGES':
            return { ...state, messages: [], offset: 0, hasMore: true };

        /**
         * 更新指定消息
         * @param {Object} action.payload - 更新信息
         * @param {string} action.payload.message_id - 要更新的消息ID。
         * @param {Partial<Message>} action.payload.updates - 要更新的消息字段，包含部分消息信息。
         * @returns {ChatState} 更新后的状态，包含更新后的消息列表。
         */
        case 'UPDATE_MESSAGE':
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg.message_id === action.payload.message_id ? { ...msg, ...action.payload.updates } : msg
                )
            };

        /**
         * 设置新对话ID
         * @param {string} action.payload - 新对话ID
         * @returns {ChatState} 更新后的状态，包含新对话ID
         */
        case 'SET_NEW_CONVERSATION_ID':
            return {
                ...state,
                newConversationId: action.payload
            };

        /**
         * 清除失败消息
         * @param {Object} action.payload - 清除信息
         * @param {string} action.payload.userMessageId - 用户消息ID
         * @param {string} action.payload.botMessageId - 机器人消息ID
         * @returns {ChatState} 更新后的状态，包含清除失败消息后的消息列表。
         */
        case 'CLEAR_FAILED_MESSAGES':
            return {
                ...state,
                messages: state.messages.filter(msg => 
                    msg.message_id !== action.payload.userMessageId && 
                    msg.message_id !== action.payload.botMessageId
                )
            };

        default:
            return state;
    }
};