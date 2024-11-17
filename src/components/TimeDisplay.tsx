'use client';

import { useState, useEffect } from 'react';

export default function TimeDisplay() {
    const [time, setTime] = useState('');

    useEffect(() => {
        setTime(new Date().toISOString());
    }, []);

    return (
        <span className="text-gray-600 dark:text-gray-300 tabular-nums">
            {time}
        </span>
    );
}