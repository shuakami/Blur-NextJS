import type { NextApiRequest, NextApiResponse } from 'next';

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

    console.log('=== 调试信息 ===');
    console.log('文件名:', filename);
    console.log('会话令牌:', sessionToken ? '存在' : '不存在');
    
    // 检查环境变量
    console.log('环境变量:', {
      NODE_ENV: process.env.NODE_ENV,
      PROD_API_URL: process.env.NEXT_PUBLIC_PROD_API_URL,
      LOCAL_API_URL: process.env.NEXT_PUBLIC_LOCAL_API_URL
    });

    // 构建API URL
    const apiUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/v1/files/output/${filename}`
      : `http://127.0.0.1:33413/api/v1/files/output/${filename}`;  // 直接硬编码测试

    console.log('尝试请求URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Accept': 'image/*, application/octet-stream'
      },
    });

    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const textResponse = await response.text();
      console.log('错误响应内容:', textResponse);
      return res.status(response.status).json({ 
        error: '获取文件失败',
        details: textResponse
      });
    }

    const buffer = await response.arrayBuffer();
    console.log('响应数据大小:', buffer.byteLength);

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    console.log('设置响应Content-Type:', contentType);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    return res.send(Buffer.from(buffer));

  } catch (error: any) {
    console.error('=== 错误详情 ===');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    
    if (error.cause) {
      console.error('错误原因:', error.cause);
    }

    return res.status(500).json({ 
      error: '获取文件失败',
      details: error.message 
    });
  }
}