export interface EmailConfig {
  user_id: string;
  username: string;
  password: string;
  email: string;
  imap_server: string;
  smtp_server: string;
}

export interface EmailConfigResponse {
  success: boolean;
  error?: string;
}

export interface EmailError {
  message: string;
  status?: number;
} 