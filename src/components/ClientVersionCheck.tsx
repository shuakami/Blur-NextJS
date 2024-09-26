// components/ClientVersionCheck.tsx
"use client";

import useVersionCheck from '@/hooks/useVersionCheck';

const ClientVersionCheck = () => {
    useVersionCheck();
    return null;
};

export default ClientVersionCheck;
