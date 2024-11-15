"use client";

import React from 'react';
import Link from 'next/link';

interface CustomButtonProps {
    label: string;
    href?: string;
    selected: boolean;
    onClick: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({ label, href = '#', selected, onClick }) => {
    return (
        <Link
            href={href}
            className={`w-[185px] mx-3 text-sm mt-1 flex items-center space-x-2 rounded-md py-2 px-3 transition-colors duration-200 text-left text-black dark:text-white ${
                selected ? 'bg-[#e0e0e0] dark:bg-[#333333]' : 'hover:bg-[#f0f0f0] dark:hover:bg-[#1e1e1e]'
            }`}
            onClick={onClick}
            prefetch={false}
        >
            <span className="flex-grow">{label}</span>
        </Link>
    );
};

export default CustomButton;
