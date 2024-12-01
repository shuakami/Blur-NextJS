// src/app/[上下文]/core/messageHandlers.ts
import { Message } from '@/types/stream';
import dialogProcessor from './DialogProcessor';
import { Dispatch } from 'react';
import { Action } from './chatReducer';
import { v4 as uuidv4 } from 'uuid';

// 基础消息验证
const isValidMessage = (message: Message): boolean => {
    return (
        message !== null &&
        typeof message === 'object' &&
        typeof message.content !== 'undefined' &&
        typeof message.type !== 'undefined'
    );
};

// 添加消息
export const addMessageHandler = (message: Message, dispatch: Dispatch<Action>) => {
    // 基础验证
    if (!isValidMessage(message)) {
        console.error('Invalid message format:', message);
        return;
    }

    const processedMessage = {
        ...dialogProcessor.updateMessage(message),
        message_id: message.message_id || `msg_${uuidv4()}`
    };

    if (process.env.NODE_ENV !== 'production') {
        console.log('添加消息', {
            id: processedMessage.message_id,
            type: processedMessage.type
        });
    }

    dispatch({ type: 'ADD_MESSAGE', payload: processedMessage });
};