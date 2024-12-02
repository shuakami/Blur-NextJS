"use client";

import AuthMethods from "@/components/auth/AuthMethods";

export default function AuthMethodsWrapper({ mode }: { mode: string }) {
    return <AuthMethods mode={mode} />;
}