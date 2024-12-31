export interface GitHubAuthResponse {
  url: string;
}

export interface GitHubCallbackResponse {
  success: boolean;
  error?: string;
}

export interface GitHubCallbackRequest {
  code: string;
  user_id: string;
}

export interface GitHubError {
  message: string;
  status?: number;
} 