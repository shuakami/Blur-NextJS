import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OverlayProps {
    isOpen: boolean;
    onClose: () => void;
    zIndex?: number;
}

/**
 * 移动端侧边栏遮罩层 - Overlay
 * @param {boolean} isOpen - 控制遮罩层是否显示
 * @param {function} onClose - 关闭遮罩层的回调函数
 * @param {number} [zIndex=30] - 遮罩层的 z-index 值
 */
const Overlay: React.FC<OverlayProps> = ({ 
    isOpen, 
    onClose,
    zIndex = 30 
}) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                className="fixed inset-0 bg-white/30 dark:bg-black/35"
                style={{ zIndex }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                    duration: 0.2,
                    ease: "easeInOut"
                }}
                onClick={onClose}
            />
        )}
    </AnimatePresence>
);

Overlay.displayName = 'Overlay';

export default Overlay;