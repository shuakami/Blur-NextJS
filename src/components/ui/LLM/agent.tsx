import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Check } from 'lucide-react';

const AgentIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => (
    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
);


const AgentCard: React.FC<{ agentName: string; content: string }> = ({ agentName, content }) => {
    const [status, setStatus] = useState<string>('receiving');
    const [displayContent, setDisplayContent] = useState<string>('');

    useEffect(() => {
        setStatus('receiving');
        setDisplayContent('');

        setTimeout(() => {
            setStatus('processing');

            let currentContent = '';
            const interval = setInterval(() => {
                if (currentContent.length < content.length) {
                    currentContent += content[currentContent.length];
                    setDisplayContent(currentContent);
                } else {
                    clearInterval(interval);
                    setStatus('completed');
                }
            }, 50);
        }, 1000);
    }, [content]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-md w-full"
        >
            <div className="flex items-center space-x-2 p-3 bg-gray-50 border-b border-gray-200">
                <AgentIcon />
                <h3 className="text-sm font-medium text-gray-700">{agentName}</h3>
                <div className="flex-grow" />
                {status === 'receiving' && <MessageCircle className="text-blue-500 animate-pulse" size={16} />}
                {status === 'processing' && <div className="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin" />}
                {status === 'completed' && <Check className="text-green-500" size={16} />}
                <span className="text-xs text-gray-500">
          {status === 'receiving' ? 'Receiving' : status === 'processing' ? 'Processing' : 'Completed'}
        </span>
            </div>
            <div className="p-3">
                <MarkdownRenderer content={displayContent} />
            </div>
        </motion.div>
    );
};

export default function AgentInteraction() {
    return (
        <div className="flex justify-center items-start p-4 min-h-screen bg-gray-100">
            <AgentCard
                agentName="Research Assistant"
                content="Analyzing the given topic...\n\n1. Identified key aspects\n2. Searching relevant databases\n3. Compiling information\n\nResults: The assessment criteria for individual health and sports performance include...[content continues]"
            />
        </div>
    );
}