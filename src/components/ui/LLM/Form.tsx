import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Option {
    id: string;
    label: string;
    description?: string;
}

interface FormProps {
    title: string;
    description: string;
    options: Option[];
    onSubmit: (selectedOptions: string[]) => void;
    multiSelect?: boolean;
}

const FormUI: React.FC<FormProps> = ({ title, description, options, onSubmit, multiSelect = false }) => {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const handleSelect = (optionId: string) => {
        setSelectedOptions(prev => {
            if (multiSelect) {
                return prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId];
            } else {
                return [optionId];
            }
        });
    };

    const handleSubmit = () => {
        onSubmit(selectedOptions);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-8 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                    <p className="text-base text-gray-500 dark:text-gray-300">{description}</p>
                </div>
                <div className="space-y-3">
                    {options.map((option) => (
                        <motion.button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                                selectedOptions.includes(option.id)
                                    ? 'bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            whileTap={{ scale: 0.995 }}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`w-5 h-5 rounded-full border flex-shrink-0 ${
                                    selectedOptions.includes(option.id)
                                        ? 'border-white/10 bg-black dark:bg-white'
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                    {selectedOptions.includes(option.id) && (
                                        <Check className="w-3 h-3 text-white dark:text-black m-auto mt-0.5" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.label}</h3>
                                    {option.description && (
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">{option.description}</p>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
                {multiSelect && (
                    <div className="flex justify-end">
                        <motion.button
                            onClick={handleSubmit}
                            className="px-3 py-1.5 cursor-pointer bg-black text-sm text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-200 transition-all duration-200"
                            disabled={selectedOptions.length === 0}
                        >
                            确定
                        </motion.button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormUI;