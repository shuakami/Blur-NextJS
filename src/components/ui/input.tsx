"use client"
import React, { useState, useRef, useEffect } from 'react'
import { Box, FileText, Send } from 'lucide-react'
import { motion, useAnimation } from 'framer-motion'

export default function Input() {
    const [isNetworkEnabled, setIsNetworkEnabled] = useState(false)
    const [inputContent, setInputContent] = useState('')
    const editorRef = useRef<HTMLDivElement>(null)
    const controls = useAnimation()

    useEffect(() => {
        const adjustHeight = () => {
            if (editorRef.current) {
                editorRef.current.style.height = "auto"
                const newHeight = Math.min(editorRef.current.scrollHeight, 170)
                controls.start({ height: newHeight })
            }
        }

        adjustHeight()
    }, [inputContent, controls])

    const handleInputChange = () => {
        if (editorRef.current) {
            setInputContent(editorRef.current.innerText)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (inputContent.trim()) {
                console.log('发送消息:', inputContent)
                setInputContent('')
                if (editorRef.current) editorRef.current.innerText = ''
            }
        }
    }

    const springConfig = { type: "spring", stiffness: 700, damping: 30 }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-4xl bg-white rounded-xl hover:shadow-xl hover:shadow-[#CDCDCD]/15 duration-500 ease-in-out transform-gpu border border-black/10"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springConfig}
            >
                <div className="relative p-4 pb-16">
                    <motion.div
                        ref={editorRef}
                        contentEditable
                        className="min-h-[100px] max-h-[170px] p-4 pr-24 text-sm-md focus:outline-none overflow-y-auto custom-scrollbar"
                        onInput={handleInputChange}
                        onKeyDown={handleKeyDown}
                        animate={controls}
                        transition={springConfig}
                    />
                    {!inputContent && (
                        <motion.div
                            className="absolute top-8 left-8 text-gray-400 pointer-events-none text-sm-md"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, ...springConfig }}
                        >
                            今天想聊点什么...
                        </motion.div>
                    )}
                    <motion.div className="absolute bottom-4 flex items-center space-x-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, ...springConfig }}
                    >
                        <button
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors duration-300 ${
                                isNetworkEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                            }`}
                            onClick={() => setIsNetworkEnabled(!isNetworkEnabled)}
                        >
                            <motion.div
                                className={`w-3 h-3 rounded-full ${isNetworkEnabled ? 'bg-blue-600' : 'bg-gray-400'}`}
                                layout
                                transition={springConfig}
                            />
                            <span>联网搜索</span>
                        </button>
                    </motion.div>
                    <motion.div
                        className="absolute right-4 bottom-4 flex items-center space-x-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, ...springConfig }}
                    >
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-300">
                            <Box className="w-5 h-5" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-300">
                            <FileText className="w-5 h-5" />
                        </button>
                        <motion.button
                            className={`p-2 rounded-md transition-colors duration-300 ${
                                inputContent ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400'
                            }`}
                            disabled={!inputContent.trim()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Send className="w-5 h-5" />
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}