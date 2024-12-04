"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from "@clerk/nextjs";
import DocumentPage from '@/components/document-page';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TicketForm } from '../../src/components/TicketForm';
import apiClient from '@/app/api/config/route';
import { toast } from '@/hooks/ui/use-toast';
import { useOnClickOutside } from '@/hooks/ui/useOnClickOutside';



export default function TicketPage() {
    const { user } = useUser();
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [ticketType, setTicketType] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [showTypeMenu, setShowTypeMenu] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    const menuRef = React.useRef<HTMLDivElement>(null);
    
    useOnClickOutside(menuRef, () => setShowTypeMenu(false));

    useEffect(() => {
        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer?.files) {
                const newFiles = Array.from(e.dataTransfer.files);
                const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024);
                setFiles(prevFiles => [...prevFiles, ...validFiles]);
            }
        };

        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('drop', handleDrop);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            toast({
                title: '请先登录',
                description: '请先登录后再提交工单',
                variant: 'destructive',
            });
            return;
        }

        if (!ticketType || !title || !content) {
            toast({
                title: '请填写完整信息',
                description: '请填写工单类型、标题和内容',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. 创建工单
            const ticketResponse = await apiClient.post('/api/v1/tickets', {
                type: ticketType,
                title,
                userId: user.id
            });

            const ticketId = ticketResponse.data.id;

            // 2. 发送文本内容消息
            if (content.trim()) {
                const formData = new FormData();
                formData.append('content', content.trim());
                
                // 确保使用FormData格式发送请求
                await apiClient.post(
                    `/api/v1/tickets/${ticketId}/messages`, 
                    formData,
                    {
                        headers: {
                            // 移除Content-Type，让浏览器自动设置正确的multipart/form-data
                            'Content-Type': undefined
                        }
                    }
                );
            }

            // 3. 上传文件消息
            if (files.length > 0) {
                await Promise.all(files.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    await apiClient.post(
                        `/api/v1/tickets/${ticketId}/messages`, 
                        formData,
                        {
                            headers: {
                                // 移除Content-Type，让浏览器自动设置正确的multipart/form-data
                                'Content-Type': undefined
                            }
                        }
                    );
                }));
            }

            setShowSuccess(true);
        } catch (error) {
            console.error('Failed to create ticket:', error);
            toast({
                title: '创建工单失败',
                description: '请稍后重试',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024);
            setFiles(prevFiles => [...prevFiles, ...validFiles]);
        }
    };

    return (
        <DocumentPage
            title="创建工单"
            description="请详细描述您遇到的问题，我们会尽快为您解答"
            backLink='/feedback'
            showFooter={false}
        >
            <div className="w-full">
                <TicketForm
                    ticketType={ticketType}
                    setTicketType={setTicketType}
                    title={title}
                    setTitle={setTitle}
                    content={content}
                    setContent={setContent}
                    files={files}
                    setFiles={setFiles}
                    isSubmitting={isSubmitting}
                    showTypeMenu={showTypeMenu}
                    setShowTypeMenu={setShowTypeMenu}
                    isDragging={isDragging}
                    menuRef={menuRef}
                    onSubmit={handleSubmit}
                    handleFileChange={handleFileChange}
                />
            </div>

            {/* 成功提示对话框 */}
            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>工单提交成功</DialogTitle>
                    </DialogHeader>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        我们已收到您的工单，将在24小时内回复，请耐心等待。
                    </p>
                    <div className="flex justify-end mt-2">
                        <Button onClick={() => window.location.href = '/feedback'}>
                            返回首页
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </DocumentPage>
    );
}