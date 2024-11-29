import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogDescription className="mt-2">
                    {message}
                </DialogDescription>
                <DialogFooter>
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmModal;