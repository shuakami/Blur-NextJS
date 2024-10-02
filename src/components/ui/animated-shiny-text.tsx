import React, {useState, useEffect, ReactNode} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
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
        let interval: NodeJS.Timeout;
        if (!isHovered) {
            interval = setInterval(() => {
                setStage((prev) => (prev === 0 ? 1 : 0));
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isHovered]);

    const textColor = darkMode ? 'gray' : 'rgba(136,136,136,0.85)';
    const hoverTextColor = darkMode ? 'lightgray' : '#555';
    const sweepColor = darkMode ? 'white' : 'black';

    return (
        <div
            className={`placeholder ${isHovered ? 'hovered' : ''}`}
            style={{color: isHovered ? hoverTextColor : textColor}}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={stage}
                    className={className}
                    data-sweep-color={sweepColor}
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -10}}
                    transition={{duration: 0.3}}
                >
                    {children || (stage === 0 ? 'Thinking...' : 'It\'s almost complete...')}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

export default Placeholder;