import React from 'react';
import { GitHubUnauthorizedResponse } from './types';
import { CARD_STYLES, TEXT_STYLES } from './constants';
import { cn } from '@/lib/utils/utils';
import { Github } from 'lucide-react';
import Link from 'next/link';
import { Route } from 'next';

interface UnauthorizedCardProps {
  data: GitHubUnauthorizedResponse;
}

export const UnauthorizedCard: React.FC<UnauthorizedCardProps> = ({ data }) => {
  return (
    <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, "relative")}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-gray-100/50 to-transparent dark:from-gray-800/50 rounded-full blur-3xl" />
      </div>
      
      <div className="relative flex items-center gap-6">
        <div className="flex-shrink-0 h-14 w-14 rounded-xl flex items-center justify-center">
          <Github className="h-7 w-7 text-gray-800 dark:text-gray-200" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(TEXT_STYLES.title, "flex items-center gap-2")}>
            连接到GitHub
          </h3>
          <p className={cn(TEXT_STYLES.subtitle, "mt-1.5")}>
            授权后即可访问您的GitHub仓库、Issue等信息
          </p>
        </div>

        <Link
          target="_blank"
          href={data.data.auth_url as Route}
          className="flex-shrink-0 inline-flex h-10 items-center justify-center rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white px-5 py-2 text-sm font-medium text-white dark:text-gray-900 transition-colors"
        >
          授权访问
        </Link>
      </div>
    </div>
  );
}; 