import React, {useEffect, useRef} from 'react';
import {motion} from 'framer-motion';

const BlurAnimatedWrapper: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    return (
        <motion.div
            ref={containerRef}
            initial={{filter: 'blur(10px)', opacity: 0}}
            animate={{filter: 'blur(0px)', opacity: 1}}
            transition={{duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9]}}
        >
            {children}
        </motion.div>
    );
};

export default BlurAnimatedWrapper;
