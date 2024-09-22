import { useTranslationContext } from '@/components/LanguageProvider';

const useTranslation = () => {
    const { t, language, setLanguage } = useTranslationContext();

    return { t, language, setLanguage };
};

export default useTranslation;
