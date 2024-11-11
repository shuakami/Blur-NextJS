import React, {FC, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
import {cn} from '@/lib/utils';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmModal: FC<ConfirmModalProps> = ({isOpen, onClose, onConfirm, title, message}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            });
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
                document.body.style.overflow = 'unset';
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!shouldRender) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className={cn(
                    "absolute inset-0 bg-black/20 transition-opacity duration-200",
                    isVisible ? "opacity-100" : "opacity-0"
                )}
            />
            
            <div
                ref={modalRef}
                className={cn(
                    "relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-[480px]",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "transition-all duration-200 ease-out transform",
                    isVisible 
                        ? "opacity-100 scale-100 translate-y-0" 
                        : "opacity-0 scale-95 translate-y-4"
                )}
            >
                <div className="flex items-center justify-between px-6 pt-6">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <X className="w-4 h-4"/>
                    </button>
                </div>

                <div className="px-6 pb-6">
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                        {message}
                    </p>
                    
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                        >
                            确认删除
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' 
        ? createPortal(modalContent, document.body)
        : null;
};

export default ConfirmModal;