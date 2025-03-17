import { FC } from 'react';
import { HeaderButtonProps } from '@/types/book';
import { cn } from '@/lib/utils/utils';

export const HeaderButton: FC<HeaderButtonProps> = ({ 
    icon, 
    onClick, 
    className, 
    children 
}) => (
    <button 
        className={cn(
            'h-7 rounded-md hover:bg-gray-100',
            className
        )}
        onClick={onClick}
    >
        {children || (
            <div className="w-[34px] flex items-center justify-center">
                {icon}
            </div>
        )}
    </button>
); 