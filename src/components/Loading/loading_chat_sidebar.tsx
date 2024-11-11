'use client'

import React from 'react'
import {motion} from 'framer-motion'
import {Skeleton} from '@/components/ui/skeleton'
import {Button} from '@/components/ui/button'
import {ScrollArea} from '@/components/ui/scroll-area'

export default function ChatSidebarLoading() {
    return (
        <div className="flex flex-col h-screen w-[220px] bg-[#F9F9F9]/65 dark:bg-[#171717] overflow-hidden">
            <ScrollArea className="flex-grow">
                <div className="flex space-x-3 mt-[12px] w-44 justify-center items-center mx-4">
                    <Button
                        variant="ghost"
                        className="w-1/2 bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121]"
                    >
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-1/2 bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121]"
                    >
                    </Button>
                </div>

                <div className="py-4 mt-2">
                    {[...Array(5)].map((_, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5, delay: index * 0.1}}
                        >
                            <div className="mx-6 my-2">
                                <Skeleton className="h-4 w-20"/>
                            </div>
                            {[...Array(3)].map((_, subIndex) => (
                                <div key={subIndex} className="mx-3 my-2">
                                    <Skeleton className="h-8 w-[185px] rounded-md shimmer">
                                        <div
                                            className="h-full w-full"/>
                                    </Skeleton>
                                </div>
                            ))}
                        </motion.div>
                    ))}
                </div>

            </ScrollArea>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full"/>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20"/>
                        <Skeleton className="h-3 w-16"/>
                    </div>
                </div>
            </div>
        </div>
    )
}