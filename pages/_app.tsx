// src/pages/_app.tsx

import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import NProgress from 'nprogress';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {LanguageProvider} from "@/components/LanguageProvider";

NProgress.configure({ showSpinner: true, speed: 500, minimum: 0.2 }); // 设置进度条速度和最小进度

function MyApp({ Component, pageProps }: AppProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleStart = () => {
            NProgress.start();
            setIsLoading(true); // 设置为 true 以显示自定义加载页面
        };

        const handleStop = () => {
            NProgress.done();
            setTimeout(() => {
                setIsLoading(false); // 停止加载页面显示
            }, 500); // 延迟以防止短暂的闪烁
        };

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleStop);
        router.events.on('routeChangeError', handleStop);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleStop);
            router.events.off('routeChangeError', handleStop);
        };
    }, [router]);

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LanguageProvider>
            <div className="transition duration-700 ease-in-out min-h-screen">
                {/* 加载动画 */}
                 <Component {...pageProps} />
            </div>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default MyApp;
