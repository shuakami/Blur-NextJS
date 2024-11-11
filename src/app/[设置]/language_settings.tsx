import React, {useState, useEffect} from "react";
import useTranslation from "@/hooks/useTranslation";
import {Search} from "lucide-react";
import {useThemeContext} from "@/theme/ThemeContext";
import {defaultLanguages} from "@/lib/languages";


export const LanguageSettings: React.FC = () => {
    const {theme} = useThemeContext();
    const {t, language, setLanguage} = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredLanguages, setFilteredLanguages] = useState(defaultLanguages);

    useEffect(() => {
        const filtered = defaultLanguages.filter((lang: { name: string; code: string; }) =>
            lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lang.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredLanguages(filtered);
    }, [searchQuery]);

    const handleLanguageChange = (langCode: string) => {
        setLanguage(langCode);
        setSearchQuery("");
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h2 className="text-2xl font-semibold mb-2">{t("语言设置")}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {t("选择您偏好的界面语言。")}
            </p>

            <div className="relative mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("搜索语言")}
                    className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-white/15 text-sm transition duration-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16}/>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {filteredLanguages.map((lang) => (
                    <div
                        key={lang.code}
                        className={`flex items-center justify-between cursor-pointer p-4 rounded-lg transition-all duration-300 ${
                            language === lang.code
                                ? `bg-gray-100 dark:bg-gray-800 ring-2 ${theme.ring()}`
                                : "hover:bg-gray-50 dark:hover:bg-gray-900"
                        }`}
                        onClick={() => handleLanguageChange(lang.code)}
                    >
                        <span className="text-sm">{lang.name}</span>
                        {language === lang.code && (
                            <div className={`w-2 h-2 ${theme.bg(500)} rounded-full`}/>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
