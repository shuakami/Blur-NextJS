import React from 'react';
import { Upload, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const TICKET_TYPES = [
    { value: 'account', label: '账号相关' },
    { value: 'billing', label: '支付相关' },
    { value: 'technical', label: '技术支持' },
    { value: 'other', label: '其他问题' }
];

interface TicketFormProps {
    ticketType: string;
    setTicketType: (type: string) => void;
    title: string;
    setTitle: (title: string) => void;
    content: string;
    setContent: (content: string) => void;
    files: File[];
    setFiles: (files: File[]) => void;
    isSubmitting: boolean;
    showTypeMenu: boolean;
    setShowTypeMenu: (show: boolean) => void;
    isDragging: boolean;
    menuRef: React.RefObject<HTMLDivElement>;
    onSubmit: (e: React.FormEvent) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TicketForm({
    ticketType,
    setTicketType,
    title,
    setTitle,
    content,
    setContent,
    files,
    setFiles,
    isSubmitting,
    showTypeMenu,
    setShowTypeMenu,
    isDragging,
    menuRef,
    onSubmit,
    handleFileChange
}: TicketFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-8">
            {/* 工单类型 */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    工单类型
                </label>
                <div className="relative" ref={menuRef}>
                    <Button 
                        variant="outline" 
                        className="w-full justify-between"
                        onClick={() => setShowTypeMenu(!showTypeMenu)}
                        type="button"
                    >
                        {ticketType ? TICKET_TYPES.find(t => t.value === ticketType)?.label : '请选择工单类型'}
                        <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                    {showTypeMenu && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                            {TICKET_TYPES.map((type) => (
                                <div
                                    key={type.value}
                                    onClick={() => {
                                        setTicketType(type.value);
                                        setShowTypeMenu(false);
                                    }}
                                    className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                                >
                                    {type.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 标题 */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    标题
                </label>
                <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="请简要描述您的问题"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50"
                />
            </div>

            {/* 问题描述 */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    问题描述
                </label>
                <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    placeholder="请详细描述您遇到的问题，包括出现的时间、具体表现等"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 resize-none"
                />
            </div>

            {/* 附件上传 */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    附件
                </label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={`pb-4 relative ${isDragging ? 'border-blue-500' : ''}`}>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`flex flex-col items-center justify-center w-full px-4 py-10 text-sm text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 cursor-pointer transition-colors ${isDragging ? 'bg-blue-50 dark:bg-blue-900 border-blue-500' : ''}`}
                                >
                                    <Upload className="w-8 h-8 mb-2 text-neutral-400" />
                                    <div className="text-center">
                                        <p className="font-medium">点击或拖拽文件到此处</p>
                                        <p className="mt-1 text-xs text-neutral-400">支持图片、PDF、Word、Excel等格式，单个文件不超过10MB</p>
                                    </div>
                                </label>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            支持的文件类型：图片、PDF、Word、Excel等
                            <br />
                            单个文件大小不超过10MB
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {files.length > 0 && (
                    <ul className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
                        {files.map((file, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                            >
                                <div className="flex items-center">
                                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded">
                                        <Upload className="w-4 h-4 text-neutral-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                                    className="p-1 text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300"
                                >
                                    <span className="sr-only">删除</span>
                                    <X className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end">
                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? '提交中...' : '提交工单'}
                </Button>
            </div>
        </form>
    );
}