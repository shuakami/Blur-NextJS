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
    console.log('添加消息:', processedMessage);
    dispatch({ type: 'ADD_MESSAGE', payload: processedMessage });
};

