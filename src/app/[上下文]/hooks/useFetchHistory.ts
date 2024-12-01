// src/app/[上下文]/useFetchHistory.ts

import { useCallback } from 'react';
import { fetchHistoryAPI, formatMessages } from '../api/chatAPI';
import dialogProcessor from '../core/DialogProcessor';
import { Dispatch } from 'react';
import { Action } from '../core/chatReducer';

interface UseFetchHistoryProps {
    state: any;
    dispatch: Dispatch<Action>;
    userId?: string;
    userImageUrl?: string;
    t: (key: string) => string;
}

const useFetchHistory = ({
    state,
    dispatch,
    userId,
    userImageUrl,
    t,
}: UseFetchHistoryProps) => {
    const fetchAndSetHistory = useCallback(async () => {
        if (!state.conversationId || !userId || !state.hasMore) return;

        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const history = await fetchHistoryAPI({
                userId,
                conversationId: state.conversationId,
                limit: 30,
                offset: state.offset,
            });

            const formattedMessages = formatMessages(history.messages, { userImageUrl }).map(msg =>
                dialogProcessor.updateMessage(msg)
            );

            if (formattedMessages.length < 10) {
                dispatch({ type: 'SET_HAS_MORE', payload: false });
            }

            dispatch({ type: 'ADD_MESSAGES', payload: formattedMessages });
            dispatch({ type: 'SET_OFFSET', payload: state.offset + 10 });
        } catch (error) {
            console.error(t('无法加载历史记录'), error);
            dispatch({ type: 'SET_HAS_MORE', payload: false });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.conversationId, userId, state.hasMore, state.offset, t, userImageUrl, dispatch]);

    return { fetchAndSetHistory };
};

export default useFetchHistory;
