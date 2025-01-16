import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const acceptLanguage = req.headers.get('Accept-Language');

    // 使用 Set 提高语言匹配的性能
    const supportedLanguages = new Set([
        'en', 'zh_cn', 'zh_tw', 'es', 'fr', 'de',
        'hi', 'ar', 'pt', 'bn', 'ru', 'ja',
        'ko', 'nl', 'sv', 'fi'
    ]);

    // 忽略内部路径和 API 路径
    if (!url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/favicon.ico')) {
        let lang = 'en'; // 默认语言为英语

        // 检查是否已有语言 cookie 设置
        const cookieLang = req.cookies.get('NEXT_LOCALE');
        if (cookieLang) {
            lang = cookieLang.value.toLowerCase();
        } else if (acceptLanguage) {
            // 从请求头中解析 Accept-Language
            const languages = acceptLanguage.split(',').map(l => l.split(';')[0].trim().toLowerCase());

            // 遍历语言列表，找到第一个匹配的支持语言
            for (const l of languages) {
                if (l.startsWith('zh')) {
                    // 优先匹配 zh_tw
                    if (supportedLanguages.has('zh_tw') && (l === 'zh-tw' || l === 'zh_tw')) {
                        lang = 'zh_tw';
                        break;
                    }
                    lang = 'zh_cn';
                    break;
                }

                // 替换 '-' 为 '_' 以匹配 supportedLanguages
                const formattedLang = l.replace('-', '_');
                if (supportedLanguages.has(formattedLang)) {
                    lang = formattedLang;
                    break;
                }
            }
        }

        // 检查重定向计数以防止循环
        const redirectCount = Number(req.cookies.get('redirect_count')?.value || '0');
        
        // 如果没有语言 cookie，并且重定向次数未超过限制
        if (!cookieLang && lang && redirectCount < 2) {
            const response = NextResponse.redirect(url);
            response.cookies.set('NEXT_LOCALE', lang, { 
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            });
            
            // 增加重定向计数
            response.cookies.set('redirect_count', String(redirectCount + 1), {
                path: '/',
                maxAge: 60 // 1分钟后过期
            });
            
            return response;
        }
    }

    // 正常请求时重置重定向计数
    const response = NextResponse.next();
    response.cookies.set('redirect_count', '0', {
        path: '/',
        maxAge: 60
    });
    
    return response;
}

// 匹配所有不属于 /api、/_next 或 favicon.ico 的路径
export const config = {
    matcher: ['/((?!api|_next|favicon.ico).*)'],
};
