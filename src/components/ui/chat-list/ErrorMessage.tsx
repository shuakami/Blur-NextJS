// src/components/ui/chat-list/ErrorMessage.tsx
import React, { memo } from "react";
import { motion } from "framer-motion";
import { CircleSlash } from "lucide-react";

// 错误消息组件
const ErrorMessage = memo(({ content }: { content: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center justify-center w-full my-4"
    >
        <div className="flex items-center space-x-3 px-4 py-3 
                      bg-red-50/50 dark:bg-red-900/10
                      border border-red-100 dark:border-red-800/30
                      rounded-lg shadow-sm max-w-[600px] w-full
                      backdrop-blur-sm">
            <CircleSlash className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-300 font-medium flex-1 min-w-0">
                {content}
            </p>
        </div>
    </motion.div>
));

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;