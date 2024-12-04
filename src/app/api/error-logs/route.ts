import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import clientPromise from '../../../lib/db/mongodb';
import { validateErrorLog } from '../../../lib/security/validate-error-log';
import { checkRateLimit } from '../../../lib/security/rate-limit';
import { sanitizeErrorLog } from '../../../lib/security/sanitize-error-log';
import { auth } from '@clerk/nextjs/server';

// 常量定义
const MAX_LOG_SIZE = 1024 * 50; // 50KB
const RATE_LIMIT = 10; // 每小时最多10次
const RATE_LIMIT_WINDOW = '1 h';

// 错误响应接口
interface ErrorResponse {
    error: string;
    details?: any;
}

export async function POST(req: NextRequest) {
    try {
        const headersList = headers();
        const ip = headersList.get('x-vercel-ip') || 
                  headersList.get('x-forwarded-for')?.split(',')[0] || 
                  'unknown';

        // 速率限制
        const limiter = await checkRateLimit(ip, RATE_LIMIT, RATE_LIMIT_WINDOW);
        if (!limiter.success) {
            const errorResponse: ErrorResponse = {
                error: 'Rate limit exceeded',
                details: { retryAfter: limiter.retryAfter }
            };
            return NextResponse.json(errorResponse, { status: 429 });
        }

        // 大小限制
        const body = await req.json();
        if (JSON.stringify(body).length > MAX_LOG_SIZE) {
            const errorResponse: ErrorResponse = {
                error: 'Payload too large',
                details: { maxSize: MAX_LOG_SIZE }
            };
            return NextResponse.json(errorResponse, { status: 413 });
        }

        // 数据验证
        const validationResult = validateErrorLog(body);
        if (!validationResult.success) {
            const errorResponse: ErrorResponse = {
                error: 'Validation failed',
                details: validationResult.error
            };
            return NextResponse.json(errorResponse, { status: 400 });
        }

        // 清理敏感信息
        const sanitizedLog = sanitizeErrorLog(validationResult.data);

        const client = await clientPromise;
        const db = client.db("error_logs");
        const collection = db.collection("logs");
        
        // 添加元数据
        const logWithMetadata = {
            ...sanitizedLog,
            createdAt: new Date(),
            environment: process.env.NODE_ENV,
            version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
            ip, // 记录 IP 以便追踪滥用
            deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
            region: process.env.VERCEL_REGION,
        };

        const result = await collection.insertOne(logWithMetadata);

        // 设置安全响应头
        const response = NextResponse.json({ 
            success: true, 
            id: result.insertedId.toString()
        }, { status: 201 });

        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');

        return response;

    } catch (error) {
        console.error('Failed to save error log:', error);
        const errorResponse: ErrorResponse = {
            error: 'Internal server error'
        };
        return NextResponse.json(errorResponse, { status: 500 });
    }
}

// GET 接口使用 Clerk 认证
export async function GET(req: NextRequest) {
    try {
        // 使用 Clerk 验证
        const { userId } = auth();
        
        if (!userId) {
            const errorResponse: ErrorResponse = {
                error: 'Authentication required'
            };
            return NextResponse.json(errorResponse, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db("error_logs");
        const collection = db.collection("logs");
        
        // 分页
        const page = Number(req.nextUrl.searchParams.get('page')) || 1;
        const limit = Math.min(
            Number(req.nextUrl.searchParams.get('limit')) || 20,
            100
        );
        
        const logs = await collection
            .find({})
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .project({ ip: 0 })
            .toArray();

        const response = NextResponse.json({
            data: logs,
            page,
            limit,
            total: await collection.countDocuments()
        });

        response.headers.set('X-Content-Type-Options', 'nosniff');
        return response;

    } catch (error) {
        console.error('Failed to fetch error logs:', error);
        const errorResponse: ErrorResponse = {
            error: 'Internal server error'
        };
        return NextResponse.json(errorResponse, { status: 500 });
    }
}