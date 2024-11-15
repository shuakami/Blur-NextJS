import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plug } from 'lucide-react';

interface PluginCallingMessageProps {
    content: string;
    plugin_id: string;
    plugin_name: string;
}

const PluginCallingMessage: React.FC<PluginCallingMessageProps> = ({
    content,
    plugin_name,
    plugin_id
}) => {
    return (
        <div className="flex flex-col min-w-0 flex-1 gap-1.5 mt-2 mb-2">
            <motion.div 
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100/70 dark:bg-background"
            >
                {/* Plugin Header */}
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">
                          {plugin_name}
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                            <span className="text-xs font-medium text-muted-foreground">
                                执行中
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PluginCallingMessage;