// src/pages/_app.tsx

import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import NProgress from 'nprogress';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { LanguageProvider } from "@/components/LanguageProvider";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import GlobalErrorHandler from "@/api/GlobalErrorHandler";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { MotionConfig } from "framer-motion";
import { LXHThemeProvider } from '@/theme/ThemeContext';

import 'nprogress/nprogress.css';
import { ApiClientProvider } from "@/api/ApiClientProvider";
import ClientVersionCheck from "@/components/ClientVersionCheck";
import type { Metadata } from "next";
import { ConversationsProvider } from "../contexts/ConversationsContext";
import seoDescription from "@/seo/seo_description";
import seoKeywords from "@/seo/seo_keywords";
import { ModelProvider } from '@/components/ui/model_selector';

NProgress.configure({ showSpinner: true, speed: 500, minimum: 0.2 });

const geistSans = localFont({
    src: "../src/app/fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
    preload: true,
    display: 'swap',
});
const geistMono = localFont({
    src: "../src/app/fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
    preload: true,
    display: 'swap',
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
    const router = useRouter();

    useEffect(() => {
        const handleStart = () => NProgress.start();
        const handleStop = () => NProgress.done();

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
                <ThemeProvider 
                    attribute="class" 
                    defaultTheme="system" 
                    enableSystem
                    disableTransitionOnChange
                >
                    <LXHThemeProvider>
                        <ModelProvider>
                            <ConversationsProvider>
                                <ApiClientProvider>
                                    <LanguageProvider>
                                        <ClientVersionCheck/>
                                        <Toaster/>
                                        <GlobalErrorHandler/>
                                        <div className={`${geistSans.variable} ${geistMono.variable} ${Inter.variable} antialiased`}>
                                            <Component {...pageProps} />
                                        </div>
                                        <SpeedInsights />
                                        <Analytics />
                                    </LanguageProvider>
                                </ApiClientProvider>
                            </ConversationsProvider>
                        </ModelProvider>
                    </LXHThemeProvider>
                </ThemeProvider>
            </ClerkProvider>
    );
}

export default MyApp;
