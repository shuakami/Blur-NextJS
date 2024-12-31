import { EmailConfig, EmailConfigResponse, EmailError } from '@/types/email';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? process.env.NEXT_PUBLIC_LOCAL_API_URL 
  : process.env.NEXT_PUBLIC_PROD_API_URL;

export class EmailService {
  static async saveConfig(config: EmailConfig): Promise<EmailConfigResponse> {
    try {
      console.log('Saving email config...');
      const response = await fetch(`${API_BASE_URL}/plugin/api/email/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      console.log('Config API response status:', response.status);
      if (!response.ok) {
        const error: EmailError = await response.json();
        throw new Error(error.message || '保存配置失败');
      }

      const result = await response.json();
      console.log('Config API response:', result);
      return result;
    } catch (error) {
      console.error('Error saving email config:', error);
      throw error;
    }
  }
} 