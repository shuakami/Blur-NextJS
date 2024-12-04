import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Clock, 
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Send,
  MoreVertical,
  User,
  Calendar,
  Tag,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format, isValid, parseISO } from 'date-fns';

import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../src/types/ticket';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTicketList } from '../../src/hooks/features/useTicketList';

// 格式化日期的工具函数
const formatDate = (dateString: string) => {
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return '';
        return format(date, 'yyyy-MM-dd HH:mm');
    } catch {
        return '';
    }
};

export default function TicketDetail() {
    const router = useRouter();
    const { id } = router.query;
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    
    const {
        selectedTicket,
        reply,
        setReply,
        isLoadingMessages,
        sendReply,
        handleSelectTicket,
        markMessageAsRead,
    } = useTicketList();

    React.useEffect(() => {
        if (id && typeof id === 'string') {
            handleSelectTicket({
                id,
                title: '',
                type: '',
                status: 'pending',
                userId: '',
                staffId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
    }, [id, handleSelectTicket]);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTicket?.messages]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || typeof id !== 'string' || !reply.trim()) return;
        
        try {
            await sendReply(id, reply);
            setReply('');
        } catch (error) {
            console.error('Failed to send reply:', error);
        }
    };

    if (isLoadingMessages || !selectedTicket) {
        return (
            <div className="h-full bg-neutral-50 dark:bg-neutral-900">
                <div className="w-full max-w-screen-2xl mx-auto">
                    <div className="animate-pulse p-6 space-y-4">
                        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-1/3" />
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
                        <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50/50 via-neutral-100/50 to-neutral-50/50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
            <div className="max-w-7xl mx-auto h-screen p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200/50 dark:border-neutral-800 overflow-hidden flex flex-col"
                >
                    {/* 头部导航 */}
                    <div className="shrink-0 px-8 py-6 border-b border-neutral-200/80 dark:border-neutral-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <Link
                                    href={{ pathname: "/feedback" }}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    返回列表
                                </Link>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-neutral-500">工单 #{id}</span>
                                    <div className={`px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_CONFIG[selectedTicket.status].className}`}>
                                        {STATUS_CONFIG[selectedTicket.status].label}
                                    </div>
                                    {selectedTicket.priority && (
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[selectedTicket.priority].dot}`} />
                                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {PRIORITY_CONFIG[selectedTicket.priority].label}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="mt-4">
                            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                {selectedTicket.title}
                            </h1>
                            <div className="mt-3 flex items-center gap-6 text-sm text-neutral-500">
                                <div className="flex items-center gap-2">
                                    <Avatar size="sm" />
                                    <span>用户 #{selectedTicket.userId}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <time dateTime={selectedTicket.createdAt}>
                                        {formatDate(selectedTicket.createdAt)}
                                    </time>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>{selectedTicket.messages?.length || 0} 条消息</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 主内容区 */}
                    <div className="flex-1 min-h-0 grid grid-cols-12">
                        {/* 消息列表 */}
                        <div className="col-span-8 border-r h-[calc(100vh-11rem)] border-neutral-200/80 dark:border-neutral-800 flex flex-col">
                            <ScrollArea className="flex-1">
                                <div className="p-8 space-y-6">
                                    {selectedTicket.messages?.map((message, index) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`flex items-start gap-4 ${
                                                message.sender === 'user' ? 'flex-row-reverse' : ''
                                            }`}
                                        >
                                            <Avatar 
                                                size="sm"
                                                className={message.sender === 'user' ? 'bg-blue-500' : 'bg-neutral-200'} 
                                            />
                                            <div className={`
                                                group relative max-w-2xl rounded-2xl px-5 py-4
                                                ${message.sender === 'user'
                                                    ? 'bg-[#2383e2] text-white'
                                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                }
                                            `}>
                                                <div className="whitespace-pre-wrap break-words">
                                                    {message.content}
                                                </div>
                                                <div className="mt-2 flex items-center gap-3 text-xs opacity-60">
                                                    <time dateTime={message.createdAt}>
                                                        {formatDate(message.createdAt)}
                                                    </time>
                                                    {message.sender === 'user' && message.read && (
                                                        <span>已读</span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* 回复框 */}
                            <div className="shrink-0 p-6 border-t border-neutral-200/80 dark:border-neutral-800">
                                <form onSubmit={handleSendReply}>
                                    <div className="relative">
                                        <textarea
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="输入回复内容..."
                                            rows={4}
                                            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#2383e2]/50"
                                        />
                                        <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                >
                                                    <Paperclip className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                >
                                                    <ImageIcon className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                >
                                                    <Smile className="w-4 h-4" />
                                                </Button>
                                            <Button
                                                type="submit"
                                                disabled={!reply.trim()}
                                            >   
                                                发送
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>  

                        {/* 右侧信息栏 */}
                        <div className="col-span-4">
                            <ScrollArea className="h-full">
                                <div className="p-6 space-y-6">
                                    <section>
                                        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                                            工单详情
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 text-sm">
                                                <User className="w-4 h-4 text-neutral-400 mt-0.5" />
                                                <div>
                                                    <div className="text-neutral-500 dark:text-neutral-400">提交用户</div>
                                                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                                                        用户 #{selectedTicket.userId}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 text-sm">
                                                <Calendar className="w-4 h-4 text-neutral-400 mt-0.5" />
                                                <div>
                                                    <div className="text-neutral-500 dark:text-neutral-400">创建时间</div>
                                                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                                                        {formatDate(selectedTicket.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 text-sm">
                                                <Tag className="w-4 h-4 text-neutral-400 mt-0.5" />
                                                <div>
                                                    <div className="text-neutral-500 dark:text-neutral-400">工单类型</div>
                                                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                                                        {selectedTicket.type || '未分类'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                                            处理进度
                                        </h3>
                                        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-neutral-600 dark:text-neutral-400">响应时间</span>
                                                <span className="text-neutral-900 dark:text-neutral-100">2小时</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-neutral-600 dark:text-neutral-400">处理时长</span>
                                                <span className="text-neutral-900 dark:text-neutral-100">4小时</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-neutral-600 dark:text-neutral-400">消息数量</span>
                                                <span className="text-neutral-900 dark:text-neutral-100">
                                                    {selectedTicket.messages?.length || 0} 条
                                                </span>
                                            </div>
                                        </div>
                                    </section>

                                    {selectedTicket.staffId && (
                                        <section>
                                            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                                                处理人员
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <Avatar size="sm" />
                                                <div>
                                                    <div className="text-sm text-neutral-900 dark:text-neutral-100">
                                                        客服 #{selectedTicket.staffId}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                        主要处理人
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    <section>
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                                        工单提醒
                                                    </div>
                                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                                        该工单已超过4小时未回复，请及时处理。
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}