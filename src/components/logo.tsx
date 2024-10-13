import React from 'react';
import Image from 'next/image';
import {useTheme} from 'next-themes';

interface LogoProps {
    withText?: boolean;  // 是否显示带文字的 Logo
    format?: 'svg' | 'webp';  // 支持的图片格式，默认 'webp' / 可选 'svg'
    className?: string;  // 支持传入自定义样式
}

// 创建一个映射表，将所有可能的路径显式列出
const logoPaths = {
    light: {
        'logo-all': {
            webp: require('/public/logo/webp/light-all.webp'),
            svg: require('/public/logo/svg/light-logo-all.svg'),
        },
        'logo-text': {
            webp: require('/public/logo/webp/light-text.webp'),
            svg: require('/public/logo/svg/light-logo-text.svg'),
        }
    },
    dark: {
        'logo-all': {
            webp: require('/public/logo/webp/dark-all.webp'),
            svg: require('/public/logo/svg/dark-logo-all.svg'),
        },
        'logo-text': {
            webp: require('/public/logo/webp/dark-text.webp'),
            svg: require('/public/logo/svg/dark-logo-text.svg'),
        }
    }
};

export const Logo: React.FC<LogoProps> = ({withText = false, format = 'webp', className = ''}) => {
    const {theme} = useTheme();  // 获取当前主题，'light' or 'dark'

    // 确定当前主题和是否包含文字的 logo 类型
    const logoType = withText ? 'logo-text' : 'logo-all';
    const logoTheme = theme === 'dark' ? 'dark' : 'light';  // 判断当前主题

    // 从映射表中获取合适的 Logo 路径
    const logoSrc = logoPaths[logoTheme][logoType][format];

    return (
        <div className={className}>
            <Image
                src={logoSrc}
                alt="Logo"
                width={200}  // 定义宽高比例，确保图片按比例缩放
                height={60}
                priority  // 优先加载
            />
        </div>
    );
};
