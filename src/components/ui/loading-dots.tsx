import { motion } from 'framer-motion';

interface LoadingDotsProps {
    size?: 'sm' | 'md';
    showText?: boolean;
    text?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
    size = 'md',
    showText = false, 
    text = '正在加载'
}) => {
    const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
    const containerSize = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
    
    return (
        <div className="flex flex-col items-center gap-3">
            <div className={`relative ${containerSize}`}>
                <div className="relative w-6 h-6">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute ${dotSize} bg-primary/60 dark:bg-primary/50 rounded-full`}
                            animate={{
                                y: [0, -8, 0],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                            style={{
                                left: `${i * 10}px`
                            }}
                        />
                    ))}
                </div>
            </div>
            {showText && (
                <span className="text-xs text-black/50 dark:text-white/50">
                    {text}
                </span>
            )}
        </div>
    );
};