'use client'

import { motion } from 'framer-motion'
import { WifiOff } from 'lucide-react'

export default function ErrorModal() {
    return (
        <div className="w-full mx-auto p-4">
            <motion.div
                className="relative overflow-hidden aspect-video rounded-xl border border-red-400 shadow-lg bg-black h-[220px] w-[600px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Holographic effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-purple-600 opacity-20"></div>
                <div className="absolute inset-0 backdrop-blur-sm"></div>

                {/* Content container */}
                <div className="relative p-6 flex flex-col justify-between">
                    <div>
                        <motion.div
                            className="flex items-center mb-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <WifiOff className="w-8 h-8 text-red-400 mr-2" />
                            <h2 className="text-3xl font-bold text-red-400">连接中断</h2>
                        </motion.div>
                        <motion.p
                            className="text-xl text-red-300 font-medium mb-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            洛杉矶 (S1) 集群连接丢失
                        </motion.p>
                    </div>

                    <motion.div
                        className="bg-red-900 bg-opacity-30 p-4 rounded-lg text-red-100 border border-red-500"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <p>技术团队正在紧急处理，预计恢复时间：2小时内</p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}