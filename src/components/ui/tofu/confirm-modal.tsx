import React, {FC, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {motion, AnimatePresence} from 'framer-motion';
import {X} from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmModal: FC<ConfirmModalProps> = ({isOpen, onClose, onConfirm, title, message}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="absolute inset-0 bg-black/20"
                    />
                    
                    <motion.div
                        ref={modalRef}
                        initial={{opacity: 0, scale: 0.98}}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            transition: {type: "spring", stiffness: 400, damping: 30}
                        }}
                        exit={{opacity: 0, scale: 0.98}}
                        className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-[480px] border border-gray-200/50 dark:border-gray-700/50"
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
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return typeof document !== 'undefined' 
        ? createPortal(modalContent, document.body)
        : null;
};

export default ConfirmModal;