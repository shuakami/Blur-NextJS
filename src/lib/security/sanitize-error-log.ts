export function sanitizeErrorLog(log: any) {
    return {
        ...log,
        stack: log.stack ? sanitizeStack(log.stack) : null,
        userAgent: sanitizeUserAgent(log.userAgent),
        search: log.search ? sanitizeSearch(log.search) : '',
    };
}

function sanitizeStack(stack: string) {
    return stack
        .replace(/\?token=[\w\-]+/g, '?token=REDACTED')
        .replace(/\/Users\/[\w\-]+\//g, '/USER_PATH/')
        .replace(/\?apiKey=[\w\-]+/g, '?apiKey=REDACTED')
        .replace(/Bearer\s+[\w\-\.]+/g, 'Bearer REDACTED')
        .replace(/password=[\w\-]+/g, 'password=REDACTED');
}

function sanitizeUserAgent(ua: string) {
    return ua.replace(/\([^\)]+\)/, '(DETAILS_REDACTED)');
}

function sanitizeSearch(search: string) {
    return search.replace(
        /([?&])(token|apiKey|password|secret)=([^&]+)/g,
        '$1$2=REDACTED'
    );
}