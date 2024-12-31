import React from 'react';
import { CARD_STYLES, TEXT_STYLES } from './constants';
import { cn } from '@/lib/utils/utils';
import { CircleDot, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Route } from 'next';

interface IssueUpdatedCardProps {
  number: number;
  title?: string;
  state?: 'open' | 'closed';
  url: string;
}

export const IssueUpdatedCard: React.FC<IssueUpdatedCardProps> = ({ number, title, state, url }) => {
  const StateIcon = state === 'closed' ? CheckCircle2 : CircleDot;
  const stateColor = state === 'closed' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400';
  const stateText = state === 'closed' ? '已关闭' : '已更新';

  return (
    <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, "relative")}>
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn(
          "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl",
          state === 'closed' 
            ? "bg-gradient-to-br from-purple-100/30 to-transparent dark:from-purple-900/20"
            : "bg-gradient-to-br from-green-100/30 to-transparent dark:from-green-900/20"
        )} />
      </div>
      
      <div className="relative flex items-center gap-6">
        <div className="flex-shrink-0 h-14 w-14 rounded-xl flex items-center justify-center">
          <StateIcon className={cn("h-7 w-7", stateColor)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={cn(TEXT_STYLES.label, stateColor, "mb-1")}>
            Issue #{number} {stateText}
          </div>
          {title && (
            <h3 className={cn(TEXT_STYLES.title, "line-clamp-1")}>
              {title}
            </h3>
          )}
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