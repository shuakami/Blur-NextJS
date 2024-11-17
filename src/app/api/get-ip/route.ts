import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
    const headersList = headers();
    
    // Vercel 特定的请求头
    const ip = headersList.get('x-vercel-ip') ||          // Vercel 专用 IP 头
               headersList.get('x-vercel-forwarded-for') || // Vercel 转发 IP
               headersList.get('x-forwarded-for')?.split(',')[0] || // 标准转发 IP
               headersList.get('x-real-ip') ||            // 真实 IP
               '未知 IP';

    // 可以添加更多 Vercel 相关的信息
    const info = {
        ip,
        // 部署相关信息
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
        region: process.env.VERCEL_REGION,
        environment: process.env.VERCEL_ENV,
    };

    return NextResponse.json(info);
}