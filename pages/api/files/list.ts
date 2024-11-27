import type { NextApiRequest, NextApiResponse } from 'next';
import axios from '@/api/config';

export const MEDIA_TYPES = {
  "png": "image/png",
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "gif": "image/gif",
  "csv": "text/csv",
  "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "txt": "text/plain",
  "json": "application/json",
  "pdf": "application/pdf"
} as const;

export interface FileInfo {
  file_id: string;
  filename: string;
  file_type: keyof typeof MEDIA_TYPES;
  url: string;
  timestamp: number;
  size?: number;
  mime_type?: string;
  metadata?: Record<string, unknown>;
}

interface FileListResponse {
  files: FileInfo[];
  total_files: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FileListResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const response = await axios.get('/api/v1/files/list');
    const data = response.data;

    // 处理文件URL，添加完整的基础URL
    const files = data.files.map((file: FileInfo) => ({
      ...file,
      url: `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/v1/files/output/${file.filename}`,
      mime_type: MEDIA_TYPES[file.file_type] || 'application/octet-stream'
    }));

    return res.status(200).json({
      files,
      total_files: data.total_files
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    return res.status(500).json({ error: '获取文件列表失败' });
  }
}