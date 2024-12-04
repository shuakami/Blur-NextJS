import type { NextApiRequest, NextApiResponse } from 'next';
import axios from '@/app/api/config/route';
import { MEDIA_TYPES } from '../list';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  const { filename } = req.query;

  if (!filename || Array.isArray(filename)) {
    return res.status(400).json({ error: '无效的文件名' });
  }

  try {
    const sessionToken = req.cookies['__session'] || 
                        req.cookies['__session_-_9sCB0w'];

    if (!sessionToken) {
      return res.status(401).json({ error: '请先登录' });
    }

    const response = await axios.get(`/api/v1/files/output/${filename}`, {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Cookie': `__session=${sessionToken}`
      }
    });

    const fileExt = filename.split('.').pop()?.toLowerCase() as keyof typeof MEDIA_TYPES;
    const contentType = MEDIA_TYPES[fileExt] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    res.setHeader('Cache-Control', 'public, max-age=3600');

    return res.send(response.data);

  } catch (error: any) {
    if (error.response?.data instanceof Buffer) {
      try {
        const errorData = JSON.parse(error.response.data.toString());
        console.error('获取文件失败:', errorData);
        
        if (error.response.status === 403) {
          return res.status(403).json({ error: errorData.detail || '未授权访问' });
        }
      } catch (e) {
        console.error('解析错误响应失败:', e);
      }
    }

    if (error.response?.status === 404) {
      return res.status(404).json({ error: '文件不存在' });
    }

    return res.status(500).json({ error: '获取文件失败' });
  }
}