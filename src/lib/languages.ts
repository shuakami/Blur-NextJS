// src/lib/languages.ts
export interface Language {
    code: string; // 语言缩写
    name: string; // 显示名称
    translationKey: string; // 用于翻译的 key
    beta?: boolean;
}

export const defaultLanguages: Language[] = [
    { code: 'en', name: 'English', translationKey: 'translation_en' },
    { code: 'zh_cn', name: '简体中文', translationKey: 'translation_zh_cn', beta: true },
    { code: 'zh_tw', name: '繁體中文', translationKey: 'translation_zh_tw', beta: true },
    { code: 'es_latam', name: 'Español (Latinoamérica)', translationKey: 'translation_es_latam' },
    { code: 'es_es', name: 'Español (España)', translationKey: 'translation_es_es' },
    { code: 'hi', name: 'हिन्दी', translationKey: 'translation_hi' },
    { code: 'fr', name: 'Français (France)', translationKey: 'translation_fr' },
    { code: 'ar', name: 'العربية', translationKey: 'translation_ar' },
    { code: 'pt', name: 'Português (Brasil)', translationKey: 'translation_pt' },
    { code: 'bn', name: 'বাংলা', translationKey: 'translation_bn' },
    { code: 'ru', name: 'Русский', translationKey: 'translation_ru' },
    { code: 'ja', name: '日本語', translationKey: 'translation_ja' },
    { code: 'de', name: 'Deutsch', translationKey: 'translation_de' },
    { code: 'ko', name: '한국어', translationKey: 'translation_ko' },
    { code: 'nl', name: 'Nederlands', translationKey: 'translation_nl' },
    { code: 'sv', name: 'Svenska', translationKey: 'translation_sv' },
    { code: 'fi', name: 'Suomi', translationKey: 'translation_fi' },
];
