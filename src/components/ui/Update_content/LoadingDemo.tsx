import { useState, useEffect, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// 提取浏览器框架组件以提升性能
const BrowserFrame = memo(() => (
    <div className="h-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-2 space-x-1.5">
        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
    </div>
));

BrowserFrame.displayName = 'BrowserFrame';

// 提取内容占位组件
const ContentSkeleton = memo(() => (
    <div className="space-y-2.5">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
    </div>
));

ContentSkeleton.displayName = 'ContentSkeleton';

const LoadingDemo = () => {
    const [stage, setStage] = useState(1);
    const [showContent1, setShowContent1] = useState(false);
    const [showContent2, setShowContent2] = useState(false);

    useEffect(() => {
        // 优化前：3秒加载动画 + 2秒内容展示
        const timer1Content = setTimeout(() => setShowContent1(true), 3000);
        const timer1Next = setTimeout(() => setStage(2), 5500);
        
        // 优化后：1.5秒加载动画 + 2秒内容展示
        const timer2Content = setTimeout(() => setShowContent2(true), 7000);
        const timer2Next = setTimeout(() => setStage(3), 9500);
        
        return () => {
            clearTimeout(timer1Content);
            clearTimeout(timer1Next);
            clearTimeout(timer2Content);
            clearTimeout(timer2Next);
        };
    }, []);

    return (
        <div className="w-full max-w-[320px]">
            <AnimatePresence mode="wait">
                {stage === 1 && (
                    <motion.div
                        key="before"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="text-sm text-center text-gray-500 dark:text-gray-400 mb-3">优化前</div>
                        <div className="w-full h-32 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <BrowserFrame />
                            <div className="p-4">
                                <AnimatePresence mode="wait">
                                    {!showContent1 ? (
                                        <motion.div 
                                            key="loading1"
                                            className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full mx-auto"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: 2, ease: "linear" }}
                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                            style={{ marginBottom: "12px" }}
                                        />
                                    ) : (
                                        <motion.div
                                            key="content1"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <ContentSkeleton />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}

                {stage === 2 && (
                    <motion.div
                        key="after"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="text-sm text-center text-gray-500 dark:text-gray-400 mb-3">优化后</div>
                        <div className="w-full h-32 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <BrowserFrame />
                            <div className="p-4">
                                <AnimatePresence mode="wait">
                                    {!showContent2 ? (
                                        <motion.div 
                                            key="loading2"
                                            className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full mx-auto"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: 0, ease: "linear" }}
                                            exit={{ opacity: 0, scale: 0.4 }}
                                            style={{ marginBottom: "12px" }}
                                        />
                                    ) : (
                                        <motion.div
                                            key="content2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ContentSkeleton />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}

                {stage === 3 && (
                    <motion.div
                        key="result"
                        className="flex items-center justify-center h-32"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <div className="text-center">
                            <motion.div 
                                className="text-3xl font-semibold text-gray-900 dark:text-white mb-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                40%
                            </motion.div>
                            <motion.div 
                                className="text-sm text-gray-500 dark:text-gray-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                            >
                                加载速度提升
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoadingDemo;