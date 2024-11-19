// src/pages/_app.tsx
import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import NProgress from 'nprogress';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, Suspense, lazy, startTransition, useState } from 'react';
import { LanguageProvider } from "@/components/LanguageProvider";
import { ClerkProvider } from "@clerk/nextjs";
import GlobalErrorHandler from "@/api/GlobalErrorHandler";
import { LXHThemeProvider } from '@/theme/ThemeContext';
import 'nprogress/nprogress.css';
import { ApiClientProvider } from "@/api/ApiClientProvider";
import type { Metadata } from "next";
import { ConversationsProvider } from "../contexts/ConversationsContext";
import seoDescription from "@/seo/seo_description";
import seoKeywords from "@/seo/seo_keywords";
import { ModelProvider } from '@/components/ui/model_selector';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { NextRouter } from 'next/router';
import type { NextComponentType, NextPageContext } from 'next';

// 懒加载非关键组件
const Analytics = lazy(() => import('@vercel/analytics/react').then(mod => ({ default: mod.Analytics })));
const SpeedInsights = lazy(() => import('@vercel/speed-insights/next').then(mod => ({ default: mod.SpeedInsights })));
const Toaster = lazy(() => import('@/components/ui/toaster').then(mod => ({ default: mod.Toaster })));
const ClientVersionCheck = lazy(() => import('@/components/ClientVersionCheck'));

// NProgress 配置
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.2 });

const description = seoDescription;
const keywords = seoKeywords.join(',');

export const metadata: Metadata = {
    title: `Blur - Meet your mirror, your muse.`,
    description: description,
    keywords: keywords
};

const LazyLoadWrapper = ({ children }: { children: React.ReactNode }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        startTransition(() => {
            setIsClient(true);
        });
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <Suspense fallback={null}>
            {children}
        </Suspense>
    );
};

interface MainContentProps {
    Component: NextComponentType<NextPageContext, any, any>;
    pageProps: any;
    router: NextRouter;
}

const MainContent = React.memo(({ Component, pageProps }: MainContentProps) => {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        startTransition(() => {
            setIsHydrated(true);
        });
    }, []);

    return (
        <div className="antialiased">
            <Component {...pageProps} />
            {isHydrated && (
                <>
                    <LazyLoadWrapper>
                        <SpeedInsights />
                    </LazyLoadWrapper>
                    <LazyLoadWrapper>
                        <Analytics />
                    </LazyLoadWrapper>
                </>
            )}
        </div>
    );
});

MainContent.displayName = 'MainContent';

const NonCriticalUI = React.memo(() => {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        startTransition(() => {
            setIsHydrated(true);
        });
    }, []);

    if (!isHydrated) {
        return null;
    }

    return (
        <>
            <LazyLoadWrapper>
                <ClientVersionCheck />
            </LazyLoadWrapper>
            <LazyLoadWrapper>
                <Toaster />
            </LazyLoadWrapper>
        </>
    );
});

NonCriticalUI.displayName = 'NonCriticalUI';

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const [isRouterReady, setIsRouterReady] = useState(false);

    useEffect(() => {
        startTransition(() => {
            setIsRouterReady(true);
        });

        const handleStart = () => {
            if (!NProgress.isStarted()) {
                NProgress.start();
            }
        };
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

    const providedContent = useMemo(() => (
        <ClerkProvider {...pageProps}>
            <ThemeProvider 
                attribute="class" 
                defaultTheme="system" 
                enableSystem
                disableTransitionOnChange
            >
                <LXHThemeProvider>
                    <ApiClientProvider>
                        <LanguageProvider>
                            <ModelProvider>
                                <ConversationsProvider>
                                    <TooltipProvider>
                                        <GlobalErrorHandler />
                                        {isRouterReady && (
                                            <>
                                                <NonCriticalUI />
                                                <MainContent 
                                                    Component={Component} 
                                                    pageProps={pageProps} 
                                                    router={router}
                                                />
                                            </>
                                        )}
                                    </TooltipProvider>
                                </ConversationsProvider>
                            </ModelProvider>
                        </LanguageProvider>
                    </ApiClientProvider>
                </LXHThemeProvider>
            </ThemeProvider>
        </ClerkProvider>
    ), [Component, pageProps, router, isRouterReady]);

    return providedContent;
}

export default MyApp;