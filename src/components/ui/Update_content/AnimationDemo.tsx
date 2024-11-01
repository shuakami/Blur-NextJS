import { useState, useEffect, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconCheck, IconLoader2, IconArrowUpRight } from '@tabler/icons-react';

// 精美的卡片组件
const DemoCard = memo(({ children, label }: { children: React.ReactNode; label: string }) => (
    <motion.div
        className="relative w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-[0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_1px_rgba(255,255,255,0.1)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
        <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full text-xs font-medium bg-black/80 text-white dark:bg-white/90 dark:text-black">
            {label}
        </div>
        {children}
    </motion.div>
));

DemoCard.displayName = 'DemoCard';

// 按钮动画示例
const ButtonDemo = memo(() => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    
    return (
        <motion.button
            className="relative px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => {
                setIsClicked(true);
                setTimeout(() => setIsClicked(false), 1000);
            }}
        >
            <motion.div className="flex items-center gap-2">
                <span>Button</span>
                <motion.div
                    animate={isHovered ? { x: 3, opacity: 1 } : { x: 0, opacity: 0.5 }}
                    transition={{ duration: 0.2 }}
                >
                    <IconArrowUpRight size={16} />
                </motion.div>
            </motion.div>
            <AnimatePresence>
                {isClicked && (
                    <motion.div
                        className="absolute inset-0 bg-gray-300/20 dark:bg-gray-700/20 rounded-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
            </AnimatePresence>
        </motion.button>
    );
});

ButtonDemo.displayName = 'ButtonDemo';

// 加载状态示例
const LoadingDemo = memo(() => {
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative h-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <IconLoader2 className="w-5 h-5 animate-spin" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        className="flex items-center gap-2 text-gray-800 dark:text-gray-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                            duration: 0.3,
                            ease: [0.23, 1, 0.32, 1]
                        }}
                    >
                        <IconCheck className="w-5 h-5" />
                        <span className="text-sm font-medium">完成</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

LoadingDemo.displayName = 'LoadingDemo';

// 列表项动画
const ListItemDemo = () => {
    const [items, setItems] = useState<string[]>(["Item 1", "Item 2"]);

    return (
        <div className="flex flex-col space-y-2">
            <AnimatePresence>
                {items.map((item, index) => (
                    <motion.div
                        key={item}
                        className="text-sm w-full px-2 py-2.5 rounded-lg bg-black/10 dark:bg-white/20 transform transition-transform duration-300"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ 
                            duration: 0.4,
                            ease: "easeInOut"
                        }}
                    >
                     <span className="mx-1.5 text-gray-800 dark:text-gray-200">{item}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

ListItemDemo.displayName = 'ListItemDemo';

const AnimationDemo = memo(() => {
    const [currentDemo, setCurrentDemo] = useState(1);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDemo(prev => (prev % 3) + 1);
        }, 4000);
        
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full max-w-[320px] space-y-4">
            <AnimatePresence mode="wait">
                {currentDemo === 1 && (
                    <DemoCard key="button" label="按钮交互">
                        <div className="p-6 flex items-center justify-center">
                            <ButtonDemo />
                        </div>
                    </DemoCard>
                )}
                
                {currentDemo === 2 && (
                    <DemoCard key="loading" label="加载状态">
                        <div className="p-6">
                            <LoadingDemo />
                        </div>
                    </DemoCard>
                )}
                
                {currentDemo === 3 && (
                    <DemoCard key="list" label="列表动画">
                        <div className="p-6">
                            <ListItemDemo />
                        </div>
                    </DemoCard>
                )}
            </AnimatePresence>
            
        </div>
    );
});

AnimationDemo.displayName = 'AnimationDemo';

export default AnimationDemo;