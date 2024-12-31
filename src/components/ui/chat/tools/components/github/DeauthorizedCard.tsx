import React from 'react';
import { CARD_STYLES, TEXT_STYLES } from './constants';
import { cn } from '@/lib/utils/utils';
import { Github, Unplug } from 'lucide-react';
import Link from 'next/link';
import { Route } from 'next';

interface DeauthorizedCardProps {
  authUrl: string;
}

export const DeauthorizedCard: React.FC<DeauthorizedCardProps> = ({ authUrl }) => {
  return (
    <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, "relative")}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-gray-100/30 to-transparent dark:from-gray-800/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative flex items-center gap-6">
        <div className="flex-shrink-0 h-14 w-14 rounded-xl flex items-center justify-center">
          <Unplug className="h-7 w-7 text-gray-600 dark:text-gray-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(TEXT_STYLES.title, "flex items-center gap-2")}>
            已取消GitHub授权
          </h3>
          <p className={cn(TEXT_STYLES.subtitle, "mt-1.5")}>
            您可以随时重新授权以继续使用GitHub功能
          </p>
        </div>

        <Link
          target="_blank"
          href={authUrl as Route}
          className="flex-shrink-0 inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-5 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors"
        >
          重新授权
        </Link>
      </div>
    </div>
  );
}; 