import React, { useEffect, useRef, memo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';

interface BlurAnimatedWrapperProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  blurStrength?: number;
}

const BlurAnimatedWrapper: React.FC<BlurAnimatedWrapperProps> = memo(({
  children,
  delay = 0,
  duration = 0.5,
  blurStrength = 10
}) => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 如果用户设置了减少动画，则使用简单的淡入效果
  const variants = prefersReducedMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  } : {
    hidden: {
      filter: `blur(${blurStrength}px)`,
      opacity: 0,
      y: 10,
      scale: 0.98
    },
    visible: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      scale: 1
    }
  };

  useEffect(() => {
    // 使用 IntersectionObserver 优化性能
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true');
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={containerRef}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{
          duration,
          delay,
          ease: [0.2, 0.65, 0.3, 0.9],
          opacity: { duration: duration * 0.75 },
          scale: { duration: duration * 0.85 },
          y: { duration: duration * 0.7 }
        }}
        style={{
          willChange: 'transform, opacity, filter',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          perspective: '1000px'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
});

BlurAnimatedWrapper.displayName = 'BlurAnimatedWrapper';

export default BlurAnimatedWrapper;