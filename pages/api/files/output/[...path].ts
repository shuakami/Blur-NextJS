import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取文件路径参数
    const pathArray = Array.isArray(req.query.path) ? req.query.path : [req.query.path || ''];
    console.log('Requested path:', pathArray);
    
    // 根据环境选择API URL
    const apiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_PROD_API_URL
      : process.env.NEXT_PUBLIC_LOCAL_API_URL;

    console.log('Current environment:', process.env.NODE_ENV);
    console.log('API URL:', apiUrl);

    // 转发到后端API
    const remoteUrl = `${apiUrl}/api/v1/files/output/${pathArray.join('/')}`;
    console.log('Forwarding to backend URL:', remoteUrl);
    
    const response = await fetch(remoteUrl);
    
    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      return res.status(response.status).json({ error: 'File not found' });
    }

    // 复制所有响应头
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // 确保设置缓存头
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // 直接发送响应体
    const data = await response.arrayBuffer();
    return res.send(Buffer.from(data));

  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 