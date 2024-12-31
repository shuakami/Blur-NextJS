import React from 'react';
import { GitHubIssue } from './types';
import { CircleDot, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { CARD_STYLES, TEXT_STYLES, ICON_STYLES, STATE_STYLES } from './constants';
import { cn } from '@/lib/utils/utils';
import Link from 'next/link';
import { Route } from 'next';

interface IssueCardProps {
  issue: GitHubIssue;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const isOpen = issue.state === 'open';
  const StateIcon = isOpen ? CircleDot : CheckCircle2;
  const stateColor = isOpen ? STATE_STYLES.open : STATE_STYLES.closed;

  return (
    <Link
      href={issue.url as Route}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(CARD_STYLES.base, CARD_STYLES.ring, CARD_STYLES.hover, "block group")}
    >
      <div className="flex gap-3">
        <StateIcon className={cn(ICON_STYLES.state, stateColor, "mt-0.5")} />
        
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className={cn(TEXT_STYLES.title, "line-clamp-1 group-hover:text-gray-700 dark:group-hover:text-gray-50")}>
              {issue.title}
            </h3>
            <ExternalLink className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 mt-1" />
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            <span className={TEXT_STYLES.label}>#{issue.number}</span>
            <span className={TEXT_STYLES.label}>·</span>
            <span className={cn(TEXT_STYLES.label, "truncate")}>{issue.repository}</span>
            {issue.comments_count > 0 && (
              <>
                <span className={TEXT_STYLES.label}>·</span>
                <span className={cn(TEXT_STYLES.label, "flex items-center gap-1")}>
                  <MessageSquare className="h-3 w-3" />
                  {issue.comments_count}
                </span>
              </>
            )}
          </div>

          {issue.body && (
            <p className={cn(TEXT_STYLES.subtitle, "line-clamp-1")}>
              {issue.body}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}; 