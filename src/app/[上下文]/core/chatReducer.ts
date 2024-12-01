import { produce } from 'immer';
import { Message, MessageStatus } from '@/types/stream';
import { v4 as uuidv4 } from 'uuid';

/**
 * 聊天状态接口
 * @interface ChatState
 * @description 管理聊天应用的全局状态
 */
export interface ChatState {
    messages: Message[];
    conversationId: string | null;
    newConversationId: string | null;
    reloadConversationsCounter: number;
    isLoading: boolean;
    hasMore: boolean;
    offset: number;
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
    | { type: 'SET_CONVERSATION_ID'; payload: string | null }
    | { type: 'ADD_MESSAGE'; payload: Message }
    | { type: 'ADD_MESSAGES'; payload: Message[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_HAS_MORE'; payload: boolean }
    | { type: 'SET_OFFSET'; payload: number }
    | { type: 'SET_IS_STREAMING'; payload: boolean }
    | { type: 'INCREMENT_RELOAD_COUNTER' }
    | { type: 'RESET_NEW_CONVERSATION_ID' }
    | { type: 'CLEAR_MESSAGES' }
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
    | { type: 'SET_NEW_CONVERSATION_ID'; payload: string }
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
 * @description 使用优化的状态更新器,处理所有聊天状态的更新操作
 * @param {ChatState} state - 当前的聊天状态
 * @param {Action} action - 要执行的动作
 * @returns {ChatState} 更新后的聊天状态
 */
export const chatReducer = produce((draft: ChatState, action: Action): void => {
    switch (action.type) {
        case 'SET_CONVERSATION_ID':
            // 设置当前对话ID
            draft.conversationId = action.payload;
            break;

        case 'ADD_MESSAGE': {
            // 添加单条消息,确保消息有唯一ID
            const messageWithId = {
                ...action.payload,
                message_id: action.payload.message_id || uuidv4()
            };
            draft.messages.push(messageWithId);
            break;
        }

        case 'ADD_MESSAGES': {
            // 批量添加消息,确保每条消息都有唯一ID
            const messagesWithIds = action.payload.map(msg => ({
                ...msg,
                message_id: msg.message_id || uuidv4()
            }));
            draft.messages.push(...messagesWithIds);
            break;
        }

        case 'SET_LOADING':
            // 设置加载状态
            draft.isLoading = action.payload;
            break;

        case 'SET_HAS_MORE':
            // 设置是否还有更多数据可加载
            draft.hasMore = action.payload;
            break;

        case 'SET_OFFSET':
            // 设置消息加载的偏移量
            draft.offset = action.payload;
            break;

        case 'SET_IS_STREAMING':
            // 设置是否正在进行流式传输
            draft.isStreaming = action.payload;
            break;

        case 'INCREMENT_RELOAD_COUNTER':
            // 增加重载计数器,触发对话列表重新加载
            draft.reloadConversationsCounter += 1;
            break;

        case 'RESET_NEW_CONVERSATION_ID':
            // 重置新对话ID
            draft.newConversationId = null;
            break;

        case 'CLEAR_MESSAGES':
            // 清空所有消息并重置相关状态
            draft.messages = [];
            draft.offset = 0;
            draft.hasMore = true;
            break;

        case 'UPDATE_MESSAGE': {
            // 更新指定消息的内容和状态
            const messageIndex = draft.messages.findIndex(
                msg => msg.message_id === action.payload.message_id
            );
            if (messageIndex !== -1) {
                Object.assign(draft.messages[messageIndex], action.payload.updates);
            }
            break;
        }

        case 'SET_NEW_CONVERSATION_ID':
            // 设置新创建的对话ID
            draft.newConversationId = action.payload;
            break;

        case 'CLEAR_FAILED_MESSAGES':
            // 清除失败的消息
            draft.messages = draft.messages.filter(msg => 
                msg.message_id !== action.payload.userMessageId && 
                msg.message_id !== action.payload.botMessageId
            );
            break;
    }
});

export default chatReducer;