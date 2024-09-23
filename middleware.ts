import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const acceptLanguage = req.headers.get('Accept-Language');

    // 支持的语言列表，全部小写
    const supportedLanguages = ['en', 'zh_cn', 'zh_tw', 'es', 'fr', 'de', 'hi', 'ar', 'pt', 'bn', 'ru', 'ja', 'ko', 'nl', 'sv', 'fi'];

    // 如果请求路径不是 Next.js 内部路径或 API 请求路径
    if (!url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api')) {
        let lang = 'en'; // 默认语言为英语

        // 检查是否已有语言 cookie 设置
        const cookieLang = req.cookies.get('NEXT_LOCALE');
        if (cookieLang) {
            lang = cookieLang.value.toLowerCase();  // 确保 cookie 中的语言代码为小写
        } else if (acceptLanguage) {
            // 从请求头中解析 Accept-Language
            const languages = acceptLanguage.split(',').map(l => l.split(';')[0].trim().toLowerCase()); // 将所有语言代码转换为小写

            // 匹配受支持的语言
            const matched = languages.find(l => {
                const baseLang = l.split('-')[0]; // 获取语言的基本部分
                if (baseLang === 'zh') {
                    // 检测到 `zh` 时强制转换为 `zh_cn`
                    return 'zh_cn';
                }
                return supportedLanguages.includes(l.replace('-', '_'));
            });

            if (matched) {
                lang = matched === 'zh' ? 'zh_cn' : matched.replace('-', '_');
            }
        }

        // 如果没有语言 cookie，并且已经确定了语言，则设置 cookie
        if (!cookieLang && lang) {
            const response = NextResponse.next();
            response.cookies.set('NEXT_LOCALE', lang, { path: '/' });
            return response;
        }
    }

    return NextResponse.next();
}

// 匹配所有不属于 /api 或 _next 的路径
export const config = {
    matcher: ['/((?!api|_next|favicon.ico).*)'],
};
