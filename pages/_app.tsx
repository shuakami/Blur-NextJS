// src/pages/_app.tsx

import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import NProgress from 'nprogress';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import React, {useEffect, useState} from 'react';
import {LanguageProvider} from "@/components/LanguageProvider";
import localFont from "next/font/local";
import {ClerkProvider} from "@clerk/nextjs";
import {Toaster} from "@/components/ui/toaster";
import GlobalErrorHandler from "@/api/GlobalErrorHandler";

import 'nprogress/nprogress.css';
import {ApiClientProvider} from "@/api/ApiClientProvider";
import ClientVersionCheck from "@/components/ClientVersionCheck";
import type {Metadata} from "next";
import {ConversationsProvider} from "../contexts/ConversationsContext";
import seoDescription from "@/seo/seo_description";
import seoKeywords from "@/seo/seo_keywords";
import { ModelProvider } from '@/components/ui/model_selector';

NProgress.configure({ showSpinner: true, speed: 500, minimum: 0.2 }); // 设置进度条速度和最小进度

const geistSans = localFont({
    src: "../src/app/fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "../src/app/fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

const Inter = localFont({
    src: "../src/app/fonts/InterDisplay-Medium.woff2",
    variable: "--font-inter",
    weight: "100 900",
});

const description = seoDescription;
const keywords = seoKeywords.join(',');

export const metadata: Metadata = {
    title: `Blur - Meet your mirror, your muse.`,
    description: description,
    keywords: keywords
};

function MyApp({ Component, pageProps }: AppProps) {
    const [, setIsLoading] = useState(false);
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
        <ClerkProvider {...pageProps}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ModelProvider>
                <ConversationsProvider>
                <ApiClientProvider>
                <LanguageProvider>
                    <ClientVersionCheck/>
                    <Toaster/>
                    <GlobalErrorHandler/>
                    <div className={`${geistSans.variable} ${geistMono.variable} ${Inter.variable} antialiased`}>
                        <div className="transition duration-700 ease-in-out min-h-screen">
                            {/* 加载动画 */}
                            <Component {...pageProps} />
                        </div>
                    </div>
                </LanguageProvider>
                </ApiClientProvider>
                </ConversationsProvider>
                </ModelProvider>
            </ThemeProvider>
        </ClerkProvider>
    );
}

export default MyApp;
