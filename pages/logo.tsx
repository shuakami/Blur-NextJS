import React from 'react';
import {motion} from 'framer-motion';
import './MoonLogo.css';

const MoonLogo: React.FC<{ className?: string }> = ({className}) => {

    return (
        <div className={`logo-container ${className}`}>
            <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className="moon-logo-svg">
                {/* 黄色大圆 (月亮) */}
                <motion.circle
                    className="moon"
                    cx="150"
                    cy="150"
                    r="100"
                    fill="#FFDE59"
                    initial={{filter: 'blur(0px)', r: 10, fill: '#ffda33'}}
                    animate={{
                        filter: ['blur(0px)', 'blur(15px)', 'blur(0px)'],
                        r: [100, 110, 100], // 轻微大小变化
                        fill: ['rgb(255,213,42)'], // 颜色渐变
                    }}
                    transition={{
                        duration: 8,   // 动画持续时间设为2秒
                        ease: 'easeInOut',
                        repeat: Infinity,   // 无限循环
                        repeatType: 'mirror',   // 模糊后反向回到清晰
                    }}
                />
                {/* 白色小圆 (月亮缺口) */}
                <motion.circle
                    className="highlight"
                    cx="220"
                    cy="100"
                    r="50"
                    fill="background"
                    initial={{filter: 'blur(0px)', r: 5}}
                    animate={{
                        filter: ['blur(0px)', 'blur(10px)', 'blur(0px)'],
                        r: [50, 55, 50], // 轻微大小变化
                    }}
                    transition={{
                        duration: 2,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatType: 'mirror',
                    }}
                />
            </svg>
        </div>
    );
};

export default MoonLogo;