import { useState, useCallback } from 'react';
import { Ticket, Message } from '../../types/ticket';
import apiClient from '@/app/api/config/route';

export function useTicketList() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [reply, setReply] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 获取工单列表
    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/api/v1/tickets');
            setTickets(response.data);
        } catch (err) {
            setError('获取工单列表失败');
            console.error('Failed to fetch tickets:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 获取工单消息并设置选中工单
    const handleSelectTicket = useCallback(async (ticket: Ticket) => {
        setIsLoadingMessages(true);
        try {
            const response = await apiClient.get(`/api/v1/tickets/${ticket.id}/messages`);
            setSelectedTicket({
                ...ticket,
                messages: response.data
            });
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setIsLoadingMessages(false);
        }
    }, []);

    // 发送回复
    const sendReply = useCallback(async (ticketId: string, content: string) => {
        if (!content.trim() || !selectedTicket) return;

        try {
            const formData = new FormData();
            formData.append('content', content.trim());

            // 发送回复
            await apiClient.post(
                `/api/v1/tickets/${ticketId}/messages`, 
                formData,
                {
                    headers: {
                        'Content-Type': undefined
                    }
                }
            );
            
            // 只获取最新消息并更新selectedTicket
            const response = await apiClient.get(`/api/v1/tickets/${ticketId}/messages`);
            setSelectedTicket(prev => prev ? {
                ...prev,
                messages: response.data
            } : null);
            
            setReply('');
        } catch (err) {
            console.error('Failed to send reply:', err);
            throw new Error('发送回复失败');
        }
    }, [selectedTicket]);

    // 标记消息已读
    const markMessageAsRead = useCallback(async (ticketId: string, messageId: string) => {
        if (!selectedTicket) return;

        try {
            await apiClient.put(`/api/v1/tickets/${ticketId}/messages/${messageId}/read`);
            
            // 只更新selectedTicket中的消息状态
            setSelectedTicket(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    messages: prev.messages ? prev.messages.map(msg => 
                        msg.id === messageId ? { ...msg, read: true } : msg
                    ) : [],
                    unreadCount: (prev.unreadCount || 0) - 1
                };
            });

            // 同步更新tickets中的未读计数
            setTickets(prev => prev.map(t => 
                t.id === ticketId 
                    ? { ...t, unreadCount: (t.unreadCount || 0) - 1 }
                    : t
            ));
        } catch (err) {
            console.error('Failed to mark message as read:', err);
        }
    }, [selectedTicket]);

    return {
        tickets,
        selectedTicket,
        setSelectedTicket,
        reply,
        setReply,
        isLoading,
        isLoadingMessages,
        error,
        sendReply,
        markMessageAsRead,
        fetchTickets,
        handleSelectTicket
    };
}