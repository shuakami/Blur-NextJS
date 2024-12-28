import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';
import { checkRateLimit } from '@/lib/security/rate-limit';

// 常量定义
const RATE_LIMIT = 50; // 每小时最多50次反馈
const RATE_LIMIT_WINDOW = '1 h';

export async function POST(req: NextRequest) {
    try {
        // 获取 IP 地址用于速率限制
        const ip = req.headers.get('x-vercel-ip') || 
                  req.headers.get('x-forwarded-for')?.split(',')[0] || 
                  'unknown';

        // 速率限制检查
        const limiter = await checkRateLimit(ip, RATE_LIMIT, RATE_LIMIT_WINDOW);
        if (!limiter.success) {
            return NextResponse.json(
                { error: '请求过于频繁' }, 
                { status: 429 }
            );
        }

        // 验证请求数据
        const body = await req.json();
        const { type, messageId, conversationId } = body;

        if (!messageId || !conversationId || !type) {
            return NextResponse.json(
                { error: '缺少必要参数' },
                { status: 400 }
            );
        }

        if (!['like', 'dislike'].includes(type)) {
            return NextResponse.json(
                { error: '无效的反馈类型' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("chat");
        const collection = db.collection("feedback");

        // 检查是否已经反馈过
        const existingFeedback = await collection.findOne({
            messageId,
            ip // 使用 IP 替代 userId
        });

        if (existingFeedback) {
            // 如果已存在反馈，则更新
            await collection.updateOne(
                { messageId, ip },
                {
                    $set: {
                        type,
                        updatedAt: new Date()
                    }
                }
            );
        } else {
            // 创建新反馈
            await collection.insertOne({
                messageId,
                conversationId,
                ip, // 使用 IP 替代 userId
                type,
                createdAt: new Date(),
                updatedAt: new Date(),
                environment: process.env.NODE_ENV,
                version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
                deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
                region: process.env.VERCEL_REGION,
            });
        }

        return NextResponse.json({ 
            success: true 
        }, { status: existingFeedback ? 200 : 201 });

    } catch (error) {
        console.error('Failed to save feedback:', error);
        return NextResponse.json(
            { error: '内部服务器错误' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const messageId = req.nextUrl.searchParams.get('messageId');
        
        if (!messageId) {
            return NextResponse.json(
                { error: '缺少消息ID' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("chat");
        const collection = db.collection("feedback");

        // 聚合统计
        const stats = await collection.aggregate([
            { $match: { messageId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        return NextResponse.json({
            likes: stats.find(s => s._id === 'like')?.count || 0,
            dislikes: stats.find(s => s._id === 'dislike')?.count || 0
        });

    } catch (error) {
        console.error('Failed to fetch feedback stats:', error);
        return NextResponse.json(
            { error: '内部服务器错误' },
            { status: 500 }
        );
    }
}