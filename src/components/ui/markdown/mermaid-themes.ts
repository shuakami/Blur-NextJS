/** 主题类型 */
export type ColorScheme = 'light' | 'dark' | 'system' | 'spring' | 'royal' | 'ocean';

/** 清新春日配色 */
export const springThemeVariables = {
    primaryColor: '#f0fdf4',
    primaryTextColor: '#15803d',
    primaryBorderColor: '#22c55e',
    lineColor: '#86efac',
    nodeBkg: '#ffffff',
    nodeBorder: '#22c55e',
    clusterBkg: '#f0fdf4',
    clusterBorder: '#4ade80',
    textColor: '#15803d',
    titleColor: '#166534',
    activeTaskBorderColor: '#22c55e',
    activeTaskBkgColor: '#dcfce7',
    labelTextColor: '#15803d',
    edgeLabelBackground: '#ffffff'
};

/** 优雅紫色配色 */
export const royalThemeVariables = {
    primaryColor: '#faf5ff',
    primaryTextColor: '#7e22ce',
    primaryBorderColor: '#a855f7',
    lineColor: '#d8b4fe',
    nodeBkg: '#ffffff',
    nodeBorder: '#a855f7',
    clusterBkg: '#faf5ff',
    clusterBorder: '#c084fc',
    textColor: '#7e22ce',
    titleColor: '#6b21a8',
    activeTaskBorderColor: '#a855f7',
    activeTaskBkgColor: '#f3e8ff',
    labelTextColor: '#7e22ce',
    edgeLabelBackground: '#ffffff'
};

/** 海洋配色 */
export const oceanThemeVariables = {
    primaryColor: '#f0f9ff',
    primaryTextColor: '#0369a1',
    primaryBorderColor: '#0ea5e9',
    lineColor: '#7dd3fc',
    nodeBkg: '#ffffff',
    nodeBorder: '#0ea5e9',
    clusterBkg: '#f0f9ff',
    clusterBorder: '#38bdf8',
    textColor: '#0369a1',
    titleColor: '#075985',
    activeTaskBorderColor: '#0ea5e9',
    activeTaskBkgColor: '#e0f2fe',
    labelTextColor: '#0369a1',
    edgeLabelBackground: '#ffffff'
};

/** 获取主题变量 */
export const getThemeVariables = (colorScheme: ColorScheme, theme: string, lightThemeVariables: any, darkThemeVariables: any) => {
    switch (colorScheme) {
        case 'spring': return springThemeVariables;
        case 'royal': return royalThemeVariables;
        case 'ocean': return oceanThemeVariables;
        case 'dark': return darkThemeVariables;
        case 'light': return lightThemeVariables;
        case 'system': return theme === 'dark' ? darkThemeVariables : lightThemeVariables;
        default: return lightThemeVariables;
    }
};