import { GitHubAuthResponse, GitHubCallbackRequest, GitHubCallbackResponse, GitHubError } from '@/types/github';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? process.env.NEXT_PUBLIC_LOCAL_API_URL 
  : process.env.NEXT_PUBLIC_PROD_API_URL;

export class GitHubService {
  static async getAuthUrl(): Promise<string> {
    try {
      console.log('Calling auth API:', `${API_BASE_URL}/plugin/api/github/auth`);
      const response = await fetch(`${API_BASE_URL}/plugin/api/github/auth`);
      
      console.log('Auth API response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }

      const data: GitHubAuthResponse = await response.json();
      console.log('Received auth URL:', data.url);
      
      if (!data.url) {
        throw new Error('Auth URL is empty');
      }

      return data.url;
    } catch (error) {
      console.error('Error getting GitHub auth URL:', error);
      throw error;
    }
  }

  static async handleCallback(code: string, userId: string): Promise<GitHubCallbackResponse> {
    try {
      console.log('Calling callback API with code:', code, 'userId:', userId);
      const response = await fetch(`${API_BASE_URL}/plugin/api/github/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, user_id: userId } as GitHubCallbackRequest),
      });

      console.log('Callback API response status:', response.status);
      if (!response.ok) {
        const error: GitHubError = await response.json();
        throw new Error(error.message || 'Failed to handle callback');
      }

      const result = await response.json();
      console.log('Callback API response:', result);
      return result;
    } catch (error) {
      console.error('Error handling GitHub callback:', error);
      throw error;
    }
  }
} 