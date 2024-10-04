import React, {FC, useEffect, useRef} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {AlertTriangle, X} from 'lucide-react';

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

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const modalVariants = {
        hidden: {opacity: 0, scale: 0.95, y: 20},
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {type: "spring", stiffness: 300, damping: 30}
        },
        exit: {opacity: 0, scale: 0.95, y: 20, transition: {duration: 0.2}}
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <motion.div
                        ref={modalRef}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden max-w-lg w-full mx-4"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
                                        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400"/>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                                >
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-7 text-base leading-relaxed">{message}</p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-3.5 py-1.5 text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="px-3.5 py-1.5 text-base bg-black text-white rounded-lg hover:bg-black transition-colors duration-200"
                                >
                                    确认
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;