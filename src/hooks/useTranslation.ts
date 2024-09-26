import { useTranslationContext } from '@/components/LanguageProvider';

const useTranslation = (additionalTranslationKey?: string) => {
    const { t, language, setLanguage } = useTranslationContext();

    return {t, language, setLanguage, additionalTranslationKey};
};

export default useTranslation;
