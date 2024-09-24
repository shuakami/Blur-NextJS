import React, { useState, useRef, useEffect } from 'react'
import { Box, FileText, Send } from 'lucide-react'
import { motion, useAnimation, AnimationProps } from 'framer-motion'

interface ChatInputProps {
    onSend: (message: string) => void;
    onNetworkToggle?: (enabled: boolean) => void;
    placeholder?: string;
    maxHeight?: number;
    springConfig?: AnimationProps['transition'];
}

const ChatInput: React.FC<ChatInputProps> = ({
                                                 onSend,
                                                 onNetworkToggle,
                                                 placeholder = '今天想聊点什么...',
                                                 maxHeight = 100,
                                                 springConfig = { type: "spring", stiffness: 700, damping: 30 }
                                             }) => {
    const [isNetworkEnabled, setIsNetworkEnabled] = useState(false)
    const [inputContent, setInputContent] = useState('')
    const editorRef = useRef<HTMLDivElement>(null)
    const controls = useAnimation()

    useEffect(() => {
        const adjustHeight = () => {
            if (editorRef.current) {
                editorRef.current.style.height = "auto"
                const newHeight = Math.min(editorRef.current.scrollHeight, maxHeight)
                controls.start({ height: newHeight })
            }
        }

        adjustHeight()
    }, [inputContent, controls, maxHeight])

    const handleInputChange = () => {
        if (editorRef.current) {
            setInputContent(editorRef.current.innerText)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleSend = () => {
        if (inputContent.trim()) {
            onSend(inputContent)
            setInputContent('')
            if (editorRef.current) editorRef.current.innerText = ''
        }
    }

    const toggleNetwork = () => {
        const newState = !isNetworkEnabled
        setIsNetworkEnabled(newState)
        onNetworkToggle?.(newState)
    }

    return (
        <div
            className="w-full bg-white rounded-lg shadow-sm hover:shadow-md hover:shadow-gray-100/75 transition-shadow duration-300 border border-gray-200">
            <div className="relative flex items-center p-2">
                <motion.div
                    ref={editorRef}
                    contentEditable
                    className="flex-grow min-h-[32px] max-h-[100px] py-1 px-2 pr-24 text-sm focus:outline-none overflow-y-auto custom-scrollbar"
                    onInput={handleInputChange}
                    onKeyDown={handleKeyDown}
                    animate={controls}
                    transition={springConfig}
                />
                {!inputContent && (
                    <motion.div
                        className="absolute left-4 text-gray-400 text-sm"
                        initial={{opacity: 0, y: 5}}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, ...springConfig }}
                    >
                        {placeholder}
                    </motion.div>
                )}
                <motion.div
                    className="flex items-center space-x-2 ml-2"
                    initial={{opacity: 0, x: 5}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: 0.3, ...springConfig}}
                >
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <Box className="w-4 h-4"/>
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <FileText className="w-4 h-4"/>
                    </button>
                    <motion.button
                        className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                            inputContent
                                ? 'bg-black text-white hover:bg-black/90'
                                : 'bg-gray-200 text-gray-400'
                        }`}
                        disabled={!inputContent.trim()}
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        onClick={handleSend}
                    >
                        <Send className="w-3 h-3 mr-1"/>
                        <span>发送</span>
                    </motion.button>
                </motion.div>
            </div>
        </div>
    )
}

export default React.memo(ChatInput)