import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ChatInputProps {
    question: string;
    onSubmit: (answer: string) => void;
}

const ChatInputUI: React.FC<ChatInputProps> = ({ question, onSubmit }) => {
    const [answer, setAnswer] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [answer]);

    const handleSubmit = () => {
        if (answer.trim()) {
            onSubmit(answer.trim());
            setAnswer('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ease-in-out">
                <div className="p-6 space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{question}</h2>
                    <div className={`relative transition-all duration-300 ease-in-out `}>
                        <textarea
                            ref={textareaRef}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="输入您的回答..."
                            className="focus:ring-1 focus:ring-gray-250 focus:dark:ring-gray-700 outline-none w-full p-4 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 resize-none overflow-hidden"
                            rows={1}
                            style={{ minHeight: '60px' }}
                        />
                        <AnimatePresence>
                            {answer.trim() && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0}}
                                    onClick={handleSubmit}
                                    className="absolute right-4 bottom-5 p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <ArrowRight size={20} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInputUI;