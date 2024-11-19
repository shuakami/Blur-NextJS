import React, {useState, useEffect, ReactNode} from 'react';
import {motion} from 'framer-motion';
import './Placeholder.css';

type PlaceholderProps = {
    darkMode?: boolean;
    children?: ReactNode;
    className?: string;
};

const Placeholder: React.FC<PlaceholderProps> = ({className, darkMode = false, children}) => {
    const [stage, setStage] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;
        
        const interval = setInterval(() => {
            setStage(prev => 1 - prev);
        }, 3500);
        
        return () => clearInterval(interval);
    }, [isHovered]);

    const styles = {
        color: isHovered 
            ? (darkMode ? '#A0A0A0' : '#555')
            : (darkMode ? '#808080' : 'rgba(136,136,136,0.85)')
    } as React.CSSProperties;

    return (
        <div
            className={`placeholder ${isHovered ? 'hovered' : ''} ${className || ''}`}
            style={styles}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.span
                className={`text`}
                data-sweep-color={darkMode ? 'dark' : 'light'}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                initial={{
                    opacity: 0,
                    y: 10,
                }}
                transition={{
                    duration: 0.3,
                    ease: 'easeOut'
                }}
            >
                {children || (stage === 0 ? 'Thinking...' : 'It\'s almost complete...')}
            </motion.span>
        </div>
    );
};

export default Placeholder;