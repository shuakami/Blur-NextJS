import React from 'react';
import { GitHubRepository } from './types';
import { Lock, ExternalLink, GitFork, Star, Eye } from 'lucide-react';
import { CARD_STYLES, TEXT_STYLES, ICON_STYLES, STATE_STYLES } from './constants';
import { cn } from '@/lib/utils/utils';

interface RepositoryCardProps {
  repository: GitHubRepository;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  return (
    <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, CARD_STYLES.hover)}>
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(TEXT_STYLES.title, "truncate")}>
                {repository.full_name}
              </h3>
              {repository.private && (
                <Lock className={cn(ICON_STYLES.base, STATE_STYLES.private)} />
              )}
            </div>
            {repository.description && (
              <p className={cn(TEXT_STYLES.subtitle, "line-clamp-2 mt-1")}>
                {repository.description}
              </p>
            )}
          </div>
          <a
            href={repository.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(TEXT_STYLES.link, "flex items-center gap-1 shrink-0")}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={cn(TEXT_STYLES.label, "flex items-center gap-1")}>
            <GitFork className={ICON_STYLES.base} />
            {repository.forks_count || 0} 分支
          </div>
          <div className={cn(TEXT_STYLES.label, "flex items-center gap-1")}>
            <Star className={ICON_STYLES.base} />
            {repository.stargazers_count || 0} 星标
          </div>
          <div className={cn(TEXT_STYLES.label, "flex items-center gap-1")}>
            <Eye className={ICON_STYLES.base} />
            {repository.watchers_count || 0} 关注
          </div>
        </div>
      </div>
    </div>
  );
}; 