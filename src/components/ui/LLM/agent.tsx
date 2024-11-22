import React, { useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Nextjs延迟导入
const MarkdownRenderer = dynamic(() => import('../../ui/markdown/MarkdownRenderer'), { ssr: false });

interface AgentData {
  type: 'agent';
  call_instance_id: string;
  agent_id: string;
  agent_name: string;
  data: string;
  status: string;
  timestamp: number;
}

interface AgentProps {
  data: AgentData;
}

export function Agent({ data }: AgentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    expanded: {
      height: "auto",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }
    },
    collapsed: {
      height: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }
    }
  };

  const contentParagraphs = typeof data?.data === 'string' 
    ? data.data.split('\n\n')
    : [];

  return (
    <div>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center gap-2 h-8"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-[18px] h-[18px] text-yellow-700 dark:text-yellow-500" />
          <span className="font-medium text-base bg-gradient-to-r from-yellow-800 to-yellow-700 dark:from-yellow-600 dark:to-yellow-500 text-transparent bg-clip-text">
            {data?.agent_name || 'Agent'}
          </span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="text-yellow-700/70 dark:text-yellow-500/70"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={variants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="blockquote">
              {contentParagraphs.map((paragraph, index) => (
                paragraph && (
                  <MarkdownRenderer key={index} content={paragraph} />
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}