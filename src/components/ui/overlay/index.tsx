import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '../../../lib/utils/utils';

interface OverlayProps {
    isOpen: boolean;
    onClose: () => void;
    zIndex?: number;
}

const Overlay: React.FC<OverlayProps> = ({ 
    isOpen, 
    onClose,
    zIndex = 30 
}) => {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (isOpen) {
            setMounted(true);
            timeoutId = setTimeout(() => {
                setVisible(true);
            }, 50);
        } else {
            setVisible(false);
            timeoutId = setTimeout(() => {
                setMounted(false);
            }, 50);
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [isOpen]);

    const handleClick = useCallback(() => {
        setVisible(false);
        setTimeout(onClose, 50);
    }, [onClose]);

    if (!mounted) return null;

    return (
        <div
            className={cn(
                "fixed inset-0",
                "transition-all duration-300 ease-in-out",
                visible ? [
                    "opacity-100",
                    "bg-white/30 dark:bg-black/35",
                ] : [
                    "opacity-0",
                    "bg-white/0 dark:bg-black/0",
                ]
            )}
            style={{ zIndex }}
            onClick={handleClick}
        />
    );
};

Overlay.displayName = 'Overlay';

export default Overlay;