import React from 'react';
import { CARD_STYLES, TEXT_STYLES } from './constants';
import { cn } from '@/lib/utils/utils';
import { CircleDot, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Route } from 'next';

interface IssueCreatedCardProps {
  number: number;
  title: string;
  url: string;
}

export const IssueCreatedCard: React.FC<IssueCreatedCardProps> = ({ number, title, url }) => {
  return (
    <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, "relative")}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-green-100/30 to-transparent dark:from-green-900/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative flex items-center gap-6">
        <div className="flex-shrink-0 h-14 w-14 rounded-xl flex items-center justify-center">
          <CircleDot className="h-7 w-7 text-green-600 dark:text-green-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={cn(TEXT_STYLES.label, "text-green-600 dark:text-green-400 mb-1")}>
            Issue #{number} 创建成功
          </div>
          <h3 className={cn(TEXT_STYLES.title, "line-clamp-1")}>
            {title}
          </h3>
        </div>

        <Link
          target="_blank"
          href={url as Route}
          className="flex-shrink-0 inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-5 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors gap-2"
        >
          查看Issue
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}; 