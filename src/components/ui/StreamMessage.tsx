// src/app/components/ui/StreamMessage.tsx
import React from 'react';

export const StreamMessage: React.FC = () => {
    return (
        <div className="flex items-center space-x-2 animate-pulse">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        </div>
    );
};
