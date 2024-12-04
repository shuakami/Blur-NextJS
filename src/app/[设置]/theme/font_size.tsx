import React, {useState} from 'react';
import {motion} from 'framer-motion';
import {useThemeContext} from '@/theme/ThemeContext';
import useTranslation from '../../../hooks/i18n/useTranslation';

const fontSizes = [
    {name: '小', value: 'sm', sample: 'Aa'},
    {name: '中', value: 'base', sample: 'Aa'},
    {name: '大', value: 'lg', sample: 'Aa'},
    {name: '特大', value: 'xl', sample: 'Aa'},
];

export const FontSizeSettings: React.FC = () => {
    const {t} = useTranslation();
    const {theme} = useThemeContext();
    const [selectedSize, setSelectedSize] = useState('base');

    const handleSizeChange = (size: string) => {
        setSelectedSize(size);
    };

    return (
        <div className="w-full max-w-full md:max-w-2xl mx-auto p-4 md:p-6">
            <h2 className="text-2xl font-semibold mb-2">{t('字体大小')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {t('选择适合您的字体大小。')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fontSizes.map((size) => (
                    <motion.div
                        key={size.value}
                        className={`flex items-center justify-between cursor-pointer p-4 rounded-lg ${
                            selectedSize === size.value
                                ? `bg-gray-100/65 dark:bg-gray-800/65 ring-2 ${theme.ring()}`
                                : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                        onClick={() => handleSizeChange(size.value)}
                        whileTap={{scale: 0.96}}
                    >
                        <span className="text-sm">{t(size.name)}</span>
                        <motion.span
                            className={`font-semibold ${
                                size.value === 'sm' ? 'text-sm' :
                                size.value === 'base' ? 'text-base' :
                                size.value === 'lg' ? 'text-lg' : 'text-xl'
                            }`}
                        >
                            {size.sample}
                        </motion.span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
