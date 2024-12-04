import React, {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {useThemeContext} from '@/theme/ThemeContext';
import useTranslation from '../../../hooks/i18n/useTranslation';

const colorThemes = [
    {key: 'default', name: '默认蓝', primary: '#3b82f6', secondary: '#93c5fd'},  // blue-500, blue-300
    {key: 'green', name: '浅湖绿', primary: '#14b8a6', secondary: '#5eead4'},  // green-500, green-300
    {key: 'yellow', name: '阳光黄', primary: '#f59e0b', secondary: '#fde68a'},  // yellow-500, yellow-200
    {key: 'orange', name: '黄昏橙', primary: '#f97316', secondary: '#fdba74'},  // orange-500, orange-300
    {key: 'pink', name: '活力粉', primary: '#ec4899', secondary: '#f472b6'},  // pink-500, pink-400
    {key: 'purple', name: '紫罗兰', primary: '#8b5cf6', secondary: '#a78bfa'},  // purple-500, purple-400
];

export const ColorThemeSettings: React.FC = () => {
    const {t} = useTranslation();
    const {themeName, setThemeName} = useThemeContext();
    const [selectedColor, setSelectedColor] = useState(colorThemes[0]); // 默认选中第一个颜色主题

    // 在组件挂载时根据当前的 themeName 选择对应的主题
    useEffect(() => {
        // 查找当前的主题在 colorThemes 中的匹配项
        const currentTheme = colorThemes.find(theme => theme.key === themeName);
        if (currentTheme) {
            setSelectedColor(currentTheme);
        } else {
            setSelectedColor(colorThemes[0]); // 如果没有匹配，使用默认的第一个主题
        }
    }, [themeName]);

    const handleColorChange = (theme: typeof colorThemes[0]) => {
        setSelectedColor(theme);
        setThemeName(theme.key); // 更新主题
    };

    return (
        <div className="w-full max-w-full md:max-w-2xl mx-auto p-4 md:p-6">
            <h2 className="text-2xl font-semibold mb-4">{t('颜色主题')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {t('选择您喜欢的颜色主题')}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex flex-wrap gap-4">
                    {colorThemes.map((theme) => (
                        <motion.div
                            key={theme.name}
                            className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full cursor-pointer ${
                                selectedColor.name === theme.name ? 'ring-[4px] ring-gray-300/75' : 'ring-1 ring-white'
                            }`}
                            style={{backgroundColor: theme.primary}}
                            onClick={() => handleColorChange(theme)}
                            whileHover={{scale: 1.1}}
                            whileTap={{scale: 0.95}}
                        />
                    ))}
                </div>

                <motion.div
                    key={selectedColor.name}
                    className="w-full sm:w-auto"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.3}}
                >
                    <p className="text-lg font-medium">{t(selectedColor.name)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('主色')}: {selectedColor.primary.toUpperCase()} / {t('次色')}: {selectedColor.secondary.toUpperCase()}
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
