// hooks/useLogin.ts
import { useState } from "react";

export default function useLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loginWithEmail = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            // 调用登录 API
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("登录失败");
            }

            // 登录成功后跳转
            window.location.href = "/";
        } catch (err) {
            // @ts-ignore
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { loginWithEmail, loading, error };
}
