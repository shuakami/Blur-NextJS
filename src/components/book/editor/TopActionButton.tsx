import { FC } from 'react';
import { TopActionButtonProps } from '@/types/book';
import { cn } from '@/lib/utils/utils';

export const TopActionButton: FC<TopActionButtonProps> = ({ 
    icon, 
    label, 
    onClick 
}) => (
    <button 
        className={cn(
            'flex items-center h-[clamp(22px,2.4vw,28px)] px-[clamp(3px,0.4vw,5px)]',
            'rounded-sm hover:bg-gray-100 text-gray-400'
        )}
        onClick={onClick}
    >
        <svg 
            viewBox="0 0 14 14" 
            className="w-[clamp(12px,1vw,16px)] h-[clamp(12px,1vw,16px)] mr-[clamp(2px,0.3vw,4px)]"
            fill="currentColor"
        >
            <path fillRule="evenodd" clipRule="evenodd" d={icon}/>
        </svg>
        <span className="text-[clamp(12px,0.9vw,14px)]">{label}</span>
    </button>
); 