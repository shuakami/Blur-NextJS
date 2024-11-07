import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Bot, MessageCircle } from 'lucide-react';

interface AgentMessageProps {
    message: {
        content: string;
        agentName: string;
        role: string;
        timestamp: string;
        thoughts?: string; // 添加思考过程
        actions?: string[]; // 添加行动步骤
        replyTo?: string; // 添加回复对象
        nextAgent?: string; // 添加下一个预期回应的专家
    };
    index: number;
    onComplete?: () => void;
    previousAgent?: string;
    messagesLength: number;
}

const agentIcons = {
    '知识专家': '🧠',
    '创意专家': '💡',
    '逻辑专家': '⚡',
    '执行专家': '🎯',
    '评审专家': '🔍',
};

const HighlightedText = ({ text }: { text: string }) => {
    // 修复正则表达式，使用正确的模式匹配完整的专家名称
    const parts = text.split(/(@(?:知识专家|创意专家|逻辑专家|执行专家|评审专家))/g);
    
    return (
        <>
            {parts.map((part, index) => {
                // 修改匹配条件，确保准确匹配专家名称
                if (part.match(/^@(?:知识专家|创意专家|逻辑专家|执行专家|评审专家)$/)) {
                    return (
                        <span 
                            key={index}
                            className="text-gray-750 bg-gray-50/60 px-1 rounded mx-0.5 font-medium"
                        >
                            {part}
                        </span>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </>
    );
};

const TypewriterText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            if (index <= text.length) {
                setDisplayedText(text.slice(0, index));
                index++;
            } else {
                clearInterval(timer);
                onComplete?.();
            }
        }, 30);

        return () => clearInterval(timer);
    }, [text]);

    return <HighlightedText text={displayedText} />;
};

const AgentMessage: React.FC<AgentMessageProps> = ({ message, index, onComplete, previousAgent, messagesLength }) => {
    const [showContent, setShowContent] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 300);
        
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white transition-shadow duration-200">
                <div className="px-5 py-3">
                    <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                                ${showContent ? 'bg-blue-50/50' : 'bg-blue-50 animate-pulse'}`}>
                                {showContent ? (
                                    <span className="text-xl">{agentIcons[message.agentName]}</span>
                                ) : (
                                    <span className="text-gray-400 text-xl">...</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-grow min-w-0 space-y-2">
                            <div className="flex items-center gap-2.5">
                                <span className="text-sm font-semibold text-gray-800">{message.agentName}</span>
                                <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-100">
                                    {message.role}
                                </span>
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed">
                                {showContent ? (
                                    <TypewriterText 
                                        text={message.content} 
                                        onComplete={onComplete} 
                                    />
                                ) : (
                                    <div className="text-gray-400 italic">正在思考...</div>
                                )}
                            </div>
                            {message.nextAgent && index === messagesLength - 1 && (
                                <div className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                    等待 <span className="font-medium text-gray-600">{message.nextAgent}</span> 的回应...
                                </div>
                            )}
                            
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function AgentContent() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(true);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    const fullMessages = [
        {
            content: "我们收到了一个关于代码性能优化的问题。从代码分析来看，主要瓶颈在于数据处理部分。@创意专家，你对优化方向有什么想法？",
            agentName: "知识专家",
            role: "需求分析",
            nextAgent: "创意专家",
            timestamp: "刚刚"
        },
        {
            content: "@知识专家 看了代码后，我认为可以通过动态规划来优化计算过程，这样可以避免大量重复运算。@逻辑专家，你能评估一下这个方案的可行性吗？",
            agentName: "创意专家",
            role: "方案设计",
            replyTo: "知识专家",
            nextAgent: "逻辑专家",
            timestamp: "刚刚"
        },
        {
            content: "@创意专家 我同意这个方向。通过分析，动态规划方案可以将时间复杂度从 O(n²) 优化到 O(n)，空间复杂度为 O(n)。这是一个很好的平衡点。",
            agentName: "逻辑专家",
            role: "方案验证",
            replyTo: "创意专家",
            timestamp: "刚刚"
        }
    ];

    const showNextMessage = useCallback(() => {
        if (currentMessageIndex < fullMessages.length) {
            setMessages(prev => [...prev, fullMessages[currentMessageIndex]]);
            setCurrentMessageIndex(prev => prev + 1);
        } else {
            setIsProcessing(false);
        }
    }, [currentMessageIndex]);

    useEffect(() => {
        if (isExpanded && currentMessageIndex === 0) {
            showNextMessage();
        }
    }, [isExpanded]);

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-xl">
                <div className="px-4 py-3 border-gray-100">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center gap-2">
                            <Bot className="text-gray-400" size={18} />
                            <span className="text-sm font-medium text-gray-700">
                                AI 专家团队
                            </span>
                            {isProcessing && (
                                <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-xs rounded">
                                    思考中...
                                </span>
                            )}
                        </div>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-2 max-h-[500px] overflow-y-auto border border-gray-100 rounded-xl"
                            ref={contentRef}
                        >
                            <div className="space-y-2">
                                {messages.map((message, index) => (
                                    <AgentMessage 
                                        key={index} 
                                        message={message} 
                                        index={index}
                                        previousAgent={index > 0 ? messages[index - 1].agentName : null}
                                        onComplete={showNextMessage}
                                        messagesLength={messages.length}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}