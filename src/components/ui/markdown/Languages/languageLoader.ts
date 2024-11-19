import hljs, { LanguageDetail, Language } from 'highlight.js';

// CDN 配置 - 按照速度和稳定性排序
const CDN_URLS = [
    'https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/highlight.js/11.4.0/languages/',
    'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/highlight.js/11.9.0/languages/',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/',
] as const;

// 已加载的语言集合
const loadedLanguages = new Set(['plaintext']);

// 加载中的语言映射
const loadingLanguages = new Map<string, Promise<void>>();

// 常用语言列表 - 按使用频率排序
export const COMMON_LANGUAGES = [
    'javascript', 
    'typescript',
    'json',
    'bash',
    'python',
    'batch'
] as const;

// 语言包缓存
const languageCache = new Map<string, string>();

// 自定义语言定义接口
interface CustomLanguageDefinition extends Partial<LanguageDetail> {
    name: string;
    aliases?: string[];
    async?: boolean;
    process?: () => Promise<Language>;
    contains: any[];
    [key: string]: any;
}

// 自定义语言映射
const CUSTOM_LANGUAGES: Record<string, CustomLanguageDefinition | (() => CustomLanguageDefinition)> = {
    'batch': () => require('./batchLanguage').default(hljs),
    'tsx': () => require('./tsxLanguage').default(hljs),
    'html': () => require('./htmlLanguage').default(hljs)
};

/**
 * 从指定 CDN 加载语言文件
 */
async function fetchFromCDN(baseUrl: string, language: string): Promise<string> {
    const response = await fetch(`${baseUrl}${language}.min.js`, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
            'Accept': '*/*'
        }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.text();
}

/**
 * 执行语言定义代码
 */
function executeLanguageCode(code: string): void {
    const script = document.createElement('script');
    script.text = code;
    document.head.appendChild(script);
    document.head.removeChild(script);
}

/**
 * 从 CDN 加载语言定义
 */
export async function loadLanguageWithRetry(language: string): Promise<void> {
    // 如果语言已加载，直接返回
    if (loadedLanguages.has(language)) return;

    // 如果语言正在加载，返回现有的 Promise
    const existingPromise = loadingLanguages.get(language);
    if (existingPromise) return existingPromise;

    // 创建新的加载 Promise
    const loadPromise = (async () => {
        try {
            // 检查缓存
            const cachedCode = languageCache.get(language);
            if (cachedCode) {
                executeLanguageCode(cachedCode);
                if (hljs.getLanguage(language)) {
                    loadedLanguages.add(language);
                    return;
                }
            }

            // 自定义语言处理
            if (language in CUSTOM_LANGUAGES) {
                const customLangFactory = CUSTOM_LANGUAGES[language];
                const customLang = typeof customLangFactory === 'function' 
                    ? customLangFactory()
                    : customLangFactory;

                if (customLang.async && customLang.process) {
                    const processedLang = await customLang.process();
                    hljs.registerLanguage(language, () => processedLang);
                } else {
                    hljs.registerLanguage(language, () => customLang as Language);
                }
                
                loadedLanguages.add(language);
                if (customLang.aliases) {
                    customLang.aliases.forEach(alias => loadedLanguages.add(alias));
                }
                return;
            }

            // 尝试从每个 CDN 加载
            for (const baseUrl of CDN_URLS) {
                try {
                    const code = await fetchFromCDN(baseUrl, language);
                    
                    // 缓存代码
                    languageCache.set(language, code);
                    
                    // 执行代码
                    executeLanguageCode(code);
                    
                    // 验证加载
                    if (hljs.getLanguage(language)) {
                        loadedLanguages.add(language);
                        return;
                    }
                } catch (error) {
                    console.warn(`Failed to load from ${baseUrl}:`, error);
                    continue;
                }
            }
            
            throw new Error(`Failed to load language ${language} from all CDNs`);
        } finally {
            // 清理加载状态
            loadingLanguages.delete(language);
        }
    })();

    // 记录加载 Promise
    loadingLanguages.set(language, loadPromise);
    return loadPromise;
}

/**
 * 预加载常用语言 - 使用 Promise.race 加快加载速度
 */
export async function preloadCommonLanguages(): Promise<void> {
    // 并行加载所有语言，但限制并发数
    const batchSize = 2;
    for (let i = 0; i < COMMON_LANGUAGES.length; i += batchSize) {
        const batch = COMMON_LANGUAGES.slice(i, i + batchSize);
        await Promise.allSettled(
            batch.map(lang => 
                loadLanguageWithRetry(lang).catch(error => 
                    console.warn(`Failed to preload language ${lang}:`, error)
                )
            )
        );
    }
}

/**
 * 检查语言是否已加载
 */
export function isLanguageLoaded(language: string): boolean {
    return loadedLanguages.has(language);
}

/**
 * 检查语言是否正在加载
 */
export function isLanguageLoading(language: string): boolean {
    return loadingLanguages.has(language);
}