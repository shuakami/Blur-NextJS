import React, { useEffect, useMemo, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { UseToolProps } from './components/weather/types';
import {
  GitHubUnauthorizedResponse,
  GitHubReposResponse,
  GitHubIssuesResponse,
  UnauthorizedCard,
  RepositoryCard,
  IssueCard,
  DeauthorizedCard,
  IssueCreatedCard,
  IssueUpdatedCard
} from './components/github';
import { CARD_STYLES, TEXT_STYLES } from './components/github/constants';
import { cn } from '@/lib/utils/utils';
import { ChevronDown } from 'lucide-react';

interface GitHubPluginResponse {
  data: {
    data: any;
    message: string;
    status: string;
  };
  plugin_name: string;
}

const ITEMS_PER_PAGE = 3;

const Tool9Component = React.memo<UseToolProps>(({
  status,
  response,
  onError
}) => {
  const [showMoreRepos, setShowMoreRepos] = useState(false);
  const [showMoreIssues, setShowMoreIssues] = useState(false);

  const { data, type } = useMemo(() => {
    const githubResponse = response as unknown as GitHubPluginResponse;
    if (!githubResponse?.data) return { data: null, type: null };

    const { status, message, data } = githubResponse.data;

    // 处理未授权状态
    if (status === 'error' && message === '需要GitHub授权' && data?.auth_url) {
      return { 
        data: {
          status: 'error',
          message,
          data: { auth_url: data.auth_url }
        } as GitHubUnauthorizedResponse,
        type: 'unauthorized'
      };
    }

    // 处理取消授权状态
    if (status === 'success' && message === '已取消GitHub授权') {
      return {
        data: data?.auth_url || '/plugin/github/auth',
        type: 'deauthorized'
      };
    }

    // 处理Issue创建成功状态
    if (status === 'success' && message === '成功创建issue' && data?.number) {
      return { data, type: 'issue_created' };
    }

    // 处理Issue更新状态
    if (status === 'success' && (message === '成功更新issue' || message === '成功关闭issue') && data?.number) {
      return { data, type: 'issue_updated' };
    }

    // 处理错误状态
    if (status === 'error') {
      return { data: { status, message, data }, type: 'error' };
    }

    // 判断响应类型
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        if (data[0]?.full_name) {
          return { 
            data: { status, message, data } as GitHubReposResponse, 
            type: 'repos' 
          };
        }
        if (data[0]?.number) {
          return { 
            data: { status, message, data } as GitHubIssuesResponse, 
            type: 'issues' 
          };
        }
      }
    }

    return { 
      data: { status, message, data }, 
      type: 'other' 
    };
  }, [response]);

  useEffect(() => {
    if (status === 'response' && !data) {
      console.error('[Tool9Component] Invalid GitHub data:', { data });
      onError?.();
    }
  }, [status, data, onError]);

  const renderContent = useMemo(() => {
    if (!data) return null;

    switch (type) {
      case 'unauthorized':
        return <UnauthorizedCard data={data as GitHubUnauthorizedResponse} />;

      case 'deauthorized':
        return <DeauthorizedCard authUrl={data as string} />;

      case 'issue_created':
        return <IssueCreatedCard {...data as { number: number; title: string; url: string }} />;

      case 'issue_updated':
        return <IssueUpdatedCard {...data as { number: number; title?: string; state?: 'open' | 'closed'; url: string }} />;

      case 'error':
        return (
          <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, CARD_STYLES.error)}>
            <p className={cn(TEXT_STYLES.subtitle, "text-red-600 dark:text-red-400")}>
              {data.message}
            </p>
          </div>
        );
      
      case 'repos': {
        const repos = (data as GitHubReposResponse).data;
        const displayRepos = showMoreRepos ? repos : repos.slice(0, ITEMS_PER_PAGE);
        const hasMoreRepos = repos.length > ITEMS_PER_PAGE;
        
        return (
          <div className="space-y-2">
            {displayRepos.map((repo) => (
              <RepositoryCard key={repo.full_name} repository={repo} />
            ))}
            {hasMoreRepos && !showMoreRepos && (
              <button
                onClick={() => setShowMoreRepos(true)}
                className={cn(
                  CARD_STYLES.base,
                  CARD_STYLES.ring,
                  CARD_STYLES.hover,
                  "w-full flex items-center justify-center gap-2 py-2",
                  TEXT_STYLES.label
                )}
              >
                显示更多仓库 ({repos.length - ITEMS_PER_PAGE}个)
                <ChevronDown className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      }
      
      case 'issues': {
        const issues = (data as GitHubIssuesResponse).data;
        const displayIssues = showMoreIssues ? issues : issues.slice(0, ITEMS_PER_PAGE);
        const hasMoreIssues = issues.length > ITEMS_PER_PAGE;
        
        return (
          <div className="space-y-2">
            {displayIssues.map((issue) => (
              <IssueCard key={`${issue.repository}-${issue.number}`} issue={issue} />
            ))}
            {hasMoreIssues && !showMoreIssues && (
              <button
                onClick={() => setShowMoreIssues(true)}
                className={cn(
                  CARD_STYLES.base,
                  CARD_STYLES.ring,
                  CARD_STYLES.hover,
                  "w-full flex items-center justify-center gap-2 py-2",
                  TEXT_STYLES.label
                )}
              >
                显示更多Issue ({issues.length - ITEMS_PER_PAGE}个)
                <ChevronDown className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      }
      
      case 'other':
        if (data.status === 'info') {
          return (
            <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, CARD_STYLES.info)}>
              <p className={cn(TEXT_STYLES.subtitle, "text-blue-600 dark:text-blue-400")}>
                {data.message}
              </p>
            </div>
          );
        }
        return (
          <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, CARD_STYLES.success)}>
            <p className={cn(TEXT_STYLES.subtitle, "text-green-600 dark:text-green-400")}>
              {data.message}
            </p>
            {data.data?.url && (
              <div className="mt-2">
                <a
                  href={data.data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={TEXT_STYLES.link}
                >
                  查看详情 →
                </a>
              </div>
            )}
          </div>
        );
    }
  }, [data, type, showMoreRepos, showMoreIssues]);

  if (status !== 'response') {
    return (
      <div className="space-y-4 py-4 px-1">
        <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, "space-y-4")}>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-4 w-[80%]" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, CARD_STYLES.error)}>
        <p className={cn(TEXT_STYLES.subtitle, "text-red-600 dark:text-red-400")}>
          未能获取GitHub数据，请检查响应格式。
        </p>
      </div>
    );
  }

  return <div className="space-y-4 py-4 px-1">{renderContent}</div>;
});

Tool9Component.displayName = 'Tool9Component';

export default Tool9Component; 