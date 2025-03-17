import { FC, ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils/utils';

// 常量配置
export const LAYOUT_CONSTANTS = {
    SIDEBAR_WIDTH: '260px',
    CONTENT_MAX_WIDTH: '850px',
} as const;

interface DynamicLayoutProps {
    children: ReactNode;
    isSidebarOpen: boolean;
    className?: string;
}

interface DynamicContentProps {
    children: ReactNode;
    isSidebarOpen: boolean;
    className?: string;
}

// 动态布局样式计算
const useDynamicStyles = (isSidebarOpen: boolean): CSSProperties => ({
    '--sidebar-width': LAYOUT_CONSTANTS.SIDEBAR_WIDTH,
    '--content-max-width': LAYOUT_CONSTANTS.CONTENT_MAX_WIDTH,
    '--available-width': 'calc(100vw - var(--sidebar-offset))',
    '--sidebar-offset': isSidebarOpen ? LAYOUT_CONSTANTS.SIDEBAR_WIDTH : '0px',
} as any);

// 动态头部组件
export const DynamicHeader: FC<DynamicLayoutProps> = ({ children, isSidebarOpen, className }) => (
    <header 
        className={cn(
            'flex justify-between mx-4 items-center overflow-hidden h-11 py-2.5',
            'fixed top-0 right-0 z-50 transition-all duration-300 ease-in-out',
            className
        )}
        style={{ left: isSidebarOpen ? LAYOUT_CONSTANTS.SIDEBAR_WIDTH : '0' }}
    >
        {children}
    </header>
);

// 动态内容组件
export const DynamicContent: FC<DynamicContentProps> = ({ children, isSidebarOpen, className }) => (
    <div 
        style={{
            ...useDynamicStyles(isSidebarOpen),
            willChange: 'transform, width, padding',
            transform: `translateX(${isSidebarOpen ? '20px' : '0px'})`,
        }}
        className={cn(
            'mx-auto',
            'transition-[transform,width,padding] duration-300 ease-out',
            'transform-gpu',
            'pt-[max(5vh,calc(100vh*0.14))]',
            'max-w-[min(var(--content-max-width),calc(var(--available-width)*0.75))]',
            'min-w-[min(100%,320px)]',
            'px-[clamp(20px,calc(2vw_+_max(0px,calc(4vw_*_(1_-_var(--available-width)/100vw)))),72px)]',
            'leading-[calc(1.5_+_0.2_*_(1_-_min(var(--content-max-width),var(--available-width))/var(--content-max-width)))]',
            'text-[clamp(16px,calc(14px_+_0.5vw),18px)]',
            className
        )}
    >
        {children}
    </div>
);

// 动态按钮组件
interface DynamicButtonGroupProps {
    children: ReactNode;
}

export const DynamicButtonGroup: FC<DynamicButtonGroupProps> = ({ children }) => (
    <div className={cn(
        'flex gap-[clamp(4px,0.5vw,6px)] mb-3 -ml-2',
        'opacity-0 group-hover:opacity-100 transition-opacity'
    )}>
        {children}
    </div>
);

// 动态标题输入组件
interface DynamicTitleInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

export const DynamicTitleInput: FC<DynamicTitleInputProps> = ({
    value,
    onChange,
    onKeyDown,
    placeholder = "无标题"
}) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn(
            'w-full text-[clamp(24px,5vw,40px)] font-bold text-gray-800',
            'leading-tight outline-none border-none bg-transparent placeholder-gray-300'
        )}
    />
); 