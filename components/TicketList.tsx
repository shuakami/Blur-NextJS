import React from 'react';
import Link from 'next/link';
import { TicketIcon, MessageSquare, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useTicketList } from '../hooks/useTicketList';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../types/ticket';

export default function TicketList() {
    const {
        tickets,
        isLoading,
        error,
        fetchTickets,
    } = useTicketList();

    React.useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    if (isLoading) {
        return (
            <div className="grid gap-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
                获取工单列表失败: {error}
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-800/50">
                    <TicketIcon className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="mt-6 text-base font-medium text-neutral-900 dark:text-neutral-100">
                    暂无工单记录
                </h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                    您还没有提交过工单，如需帮助请点击上方的"提交工单"按钮
                </p>
            </div>
        );
    }

    // 统计数据
    const stats = {
        total: tickets.length,
        pending: tickets.filter(t => t.status === 'pending').length,
        processing: tickets.filter(t => t.status === 'processing').length,
        closed: tickets.filter(t => t.status === 'closed').length,
    };

    return (
        <div className="space-y-4">
            {tickets.slice(0, 5).map((ticket) => (
                <Link 
                    key={ticket.id}
                    href={`/ticket/${ticket.id}` as any}
                    className="block bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                    <div className="px-6 py-5 flex items-center gap-6">
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {ticket.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <span className="font-mono">#{ticket.id}</span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[ticket.status].className}`}>
                                {STATUS_CONFIG[ticket.status].label}
                            </span>
                        </div>

                        <time 
                            dateTime={ticket.updatedAt}
                            className="text-xs text-neutral-500 ml-auto"
                        >
                            {format(new Date(ticket.updatedAt), 'MM/dd HH:mm')}
                        </time>

                        <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    </div>
                </Link>
            ))}
            
            {tickets.length > 5 && (
                <Link 
                    href={"/tickets" as any}
                    className="block px-6 py-3 text-center text-sm text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                    查看全部工单
                </Link>
            )}
        </div>
    );
}