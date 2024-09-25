// src/components/ui/StreamMessage.tsx
import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';

// 定义动画组件的 Props 类型
interface StreamMessageProps {
    content: string;
    chunkSpeed?: number; // 控制文字输出的速度（毫秒）
    onComplete?: () => void; // 动画完成后的回调
}

// 动画渐入的配置
const letterVariants = {
    hidden: {opacity: 0, y: -5},
    visible: {opacity: 1, y: 0},
};

// 动画组件
const StreamMessage: React.FC<StreamMessageProps> = ({content, chunkSpeed = 30, onComplete}) => {
    const [displayedText, setDisplayedText] = useState<string>('');
    const [textIndex, setTextIndex] = useState<number>(0);

    // 动态更新文本内容，逐字输出
    useEffect(() => {
        if (textIndex >= content.length) {
            if (onComplete) {
                onComplete(); // 当动画完成时调用回调函数
            }
            return;
        }

        const timeout = setTimeout(() => {
            setDisplayedText((prev) => prev + content[textIndex]);
            setTextIndex((prev) => prev + 1);
        }, chunkSpeed);

        return () => clearTimeout(timeout); // 清除定时器
    }, [content, textIndex, chunkSpeed, onComplete]);

    return (
        <motion.div
            className="stream-message"
            initial="hidden"
            animate="visible"
            variants={{
                visible: {transition: {staggerChildren: 0.02}},
            }}
        >
            {displayedText.split('').map((letter, index) => (
                <motion.span key={index} variants={letterVariants}>
                    {letter}
                </motion.span>
            ))}
        </motion.div>
    );
};

export default StreamMessage;
