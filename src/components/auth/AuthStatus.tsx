// src/components/auth/AuthStatus.tsx

"use client";

import {useUser} from "@clerk/nextjs";

export const useAuthStatus = () => {
    const {isLoaded, isSignedIn} = useUser();

    return {
        isLoaded,
        isSignedIn,
    };
};
