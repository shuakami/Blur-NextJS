import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import CodeBlock from '../markdown/code';
import { cn } from '@/lib/utils';

interface PluginResponseMessageProps {
    content: string;
    plugin_response?: {
        plugin_id: number;
        plugin_name: string;
        data: any;
        status: string;
    };
}

const PluginResponseMessage: React.FC<PluginResponseMessageProps> = ({
    content,
    plugin_response
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flex flex-col min-w-0 flex-1 gap-1.5">
            <motion.div 
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100/70 dark:bg-transparent overflow-hidden mt-2 mb-2"
            >
                {/* Plugin Header */}
                <div 
                    className="p-4 cursor-pointer select-none transition-colors duration-150"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: isExpanded ? 0 : -90 }}
                                transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                            >
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </motion.div>
                            <span className="text-sm font-medium text-card-foreground">
                                {plugin_response?.plugin_name}
                            </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-900/30">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                执行成功
                            </span>
                        </div>
                    </div>
                </div>

                {/* Response Data Section */}
                <motion.div
                    animate={{
                        height: isExpanded ? "auto" : 0,
                        opacity: isExpanded ? 1 : 0
                    }}
                    transition={{
                        height: { duration: 0.2, ease: [0.32, 0.72, 0, 1] },
                        opacity: { duration: 0.15 }
                    }}
                    className="bg-gray-100/70 dark:bg-gray-900 origin-top"
                >
                    <div className={cn(
                        "p-4 transition-transform duration-150",
                        isExpanded ? "translate-y-0" : "translate-y-1"
                    )}>
                        <CodeBlock code={plugin_response?.data} forceRenderBlock={true} />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PluginResponseMessage;