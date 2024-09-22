import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const acceptLanguage = req.headers.get('Accept-Language');
    const supportedLanguages = ['en', 'zh', 'es', 'fr', 'de', 'hi', 'ar', 'pt', 'bn', 'ru', 'ja', 'ko', 'nl', 'sv', 'fi'];

    if (!url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api')) {
        let lang = 'en'; // default language

        const cookieLang = req.cookies.get('NEXT_LOCALE');
        if (cookieLang) {
            lang = cookieLang.value;
        } else if (acceptLanguage) {
            const languages = acceptLanguage.split(',').map(l => l.split(';')[0].trim());
            const matched = languages.find(l => supportedLanguages.includes(l.split('-')[0]));
            if (matched) {
                lang = matched.split('-')[0];
            }
        }

        // Set the language in the response cookies if not already set
        if (!cookieLang && lang) {
            const response = NextResponse.next();
            response.cookies.set('NEXT_LOCALE', lang, { path: '/' });
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next|favicon.ico).*)'],
};
