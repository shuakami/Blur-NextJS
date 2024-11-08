// src/app/[上下文]/messageHandlers.ts

import { Message } from '@/types/stream';
import dialogProcessor from './DialogProcessor';
import { Dispatch } from 'react';
import { Action } from './chatReducer';
import { v4 as uuidv4 } from 'uuid';

// 添加消息
export const addMessageHandler = (message: Message, dispatch: Dispatch<Action>) => {
    const processedMessage = {
        ...dialogProcessor.updateMessage(message),
        message_id: message.message_id || uuidv4()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: processedMessage });
};

// 更新最后一个机器人消息
export const updateLastBotMessageHandler = (chunkContent: string, messages: Message[], dispatch: Dispatch<Action>) => {
    const lastStreamingBotMessage = [...messages].reverse().find(
        (msg) => msg.type === 'bot' && msg.isStreaming
    );
    if (lastStreamingBotMessage) {
        dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
                message_id: lastStreamingBotMessage.message_id,
                updates: {
                    content: lastStreamingBotMessage.content + chunkContent
                }
            }
        });
    }
};
