// 基础响应类型
export interface GitHubBaseResponse {
  status: 'success' | 'error' | 'info';
  message: string;
  data: any;
}

// 未授权响应
export interface GitHubUnauthorizedResponse extends GitHubBaseResponse {
  data: {
    auth_url: string;
  };
}

// 仓库信息
export interface GitHubRepository {
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  url: string;
  default_branch: string;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
}

// 仓库列表响应
export interface GitHubReposResponse extends GitHubBaseResponse {
  data: GitHubRepository[];
}

// Issue信息
export interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  body: string;
  created_at: string;
  url: string;
  repository: string;
  comments_count: number;
}

// Issue列表响应
export interface GitHubIssuesResponse extends GitHubBaseResponse {
  data: GitHubIssue[];
}

// Issue操作响应
export interface GitHubIssueActionResponse extends GitHubBaseResponse {
  data: {
    number: number;
    title?: string;
    state?: 'open' | 'closed';
    url: string;
  };
}

// 评论操作响应
export interface GitHubCommentActionResponse extends GitHubBaseResponse {
  data: {
    id: string;
    url: string;
  };
}

// 删除评论响应
export interface GitHubDeleteCommentResponse extends GitHubBaseResponse {
  data: {
    comment_id: string;
  };
}

// 通用错误响应
export interface GitHubErrorResponse extends GitHubBaseResponse {
  data: null;
}

// 数据限制提示响应
export interface GitHubInfoResponse extends GitHubBaseResponse {
  data: null;
}

// 组合所有可能的响应类型
export type GitHubResponse =
  | GitHubUnauthorizedResponse
  | GitHubReposResponse
  | GitHubIssuesResponse
  | GitHubIssueActionResponse
  | GitHubCommentActionResponse
  | GitHubDeleteCommentResponse
  | GitHubErrorResponse
  | GitHubInfoResponse; 