import React, {useState, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';

const BlurAnimatedWrapper: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            {threshold: 0.1}
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    return (
        <motion.div
            ref={containerRef}
            initial={{filter: 'blur(10px)', opacity: 0}}
            animate={isVisible ? {filter: 'blur(0px)', opacity: 1} : {}}
            transition={{duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9]}}
        >
            {children}
        </motion.div>
    );
};

export default BlurAnimatedWrapper;