'use client'

import React from 'react'
import {motion} from 'framer-motion'
import {Skeleton} from "@/components/ui/skeleton"
import ChatSidebarLoading from "@/components/Loading/loading_chat_sidebar";

const SIDEBAR_WIDTH = 220

export default function HomePageLoading() {
    return (
        <div className="w-full h-screen flex overflow-hidden">
            {/* Sidebar*/}
            <motion.div
                className="fixed top-0 left-0 h-full z-30"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.3, ease: "easeInOut"}}
            >
                <ChatSidebarLoading/>
            </motion.div>

            {/* Main content */}
            <motion.div
                className="flex flex-col h-full w-full overflow-hidden"
                style={{marginLeft: SIDEBAR_WIDTH}}
                initial={{marginLeft: SIDEBAR_WIDTH}}
                animate={{marginLeft: SIDEBAR_WIDTH}}
                transition={{duration: 0.3, ease: "easeInOut"}}
            >

                {/* Chat content*/}
                <div className="flex-1 overflow-auto w-full">
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        {/* Chat list placeholder */}
                        {[...Array(5)].map((_, index) => (
                            <motion.div
                                key={index}
                                className="mb-4"
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: index * 0.1}}
                            >
                                <Skeleton className="h-20 w-full mb-2"/>
                                <Skeleton className="h-4 w-3/4"/>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="p-4 flex flex-col items-center w-full ">
                    <div className="w-full max-w-4xl">
                        <Skeleton className="h-12 w-full mb-2"/>
                        <Skeleton className="h-4 w-1/2 mx-auto"/>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}