// src/pages/_app.tsx
import { AppProps } from 'next/app';
import '@/styles/globals.css';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, Suspense, lazy, startTransition, useState, memo } from 'react';
import { LanguageProvider } from "@/components/LanguageProvider";
import { ClerkProvider } from "@clerk/nextjs";
import GlobalErrorHandler from "@/api/GlobalErrorHandler";
import { LXHThemeProvider } from '@/theme/ThemeContext';
import { ApiClientProvider } from "@/api/ApiClientProvider";
import { ConversationsProvider } from "../src/app/[对话管理]/ConversationsContext";
import seoDescription from "@/seo/seo_description";
import seoKeywords from "@/seo/seo_keywords";
import { ModelProvider } from '@/components/ui/model_selector';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { NextRouter } from 'next/router';
import type { Metadata, NextComponentType, NextPageContext } from 'next';
import { ShortcutProvider } from '@/providers/ShortcutProvider';
import { LayoutProvider } from "@/components/layouts/LayoutContext";
import CustomThemeProvider from '@/theme/CustomThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConversationProvider } from "../src/app/[上下文]/contexts";
import { ConversationState } from "../src/app/[上下文]/types/chat";


// 懒加载非关键组件
const Analytics = lazy(() => import('@vercel/analytics/react').then(mod => ({ default: mod.Analytics })));
const SpeedInsights = lazy(() => import('@vercel/speed-insights/next').then(mod => ({ default: mod.SpeedInsights })));
const Toaster = lazy(() => import('@/components/ui/toaster').then(mod => ({ default: mod.Toaster })));
const ClientVersionCheck = lazy(() => import('@/components/ClientVersionCheck'));


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
    
    // 添加 QueryClient
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    // 创建会话状态
    const [reloadCounter, setReloadCounter] = useState(0);
    const conversationState = useMemo<ConversationState>(() => ({
        conversationId: null,
        newConversationId: null,
        resetNewConversationId: () => {},
        triggerConversationsReload: () => setReloadCounter(prev => prev + 1),
        reloadConversationsCounter: reloadCounter,
        isConversationPage: false
    }), [reloadCounter]);

    useEffect(() => {
        startTransition(() => {
            setIsRouterReady(true);
        });
    }, [router]);


    const providedContent = useMemo(() => (
        <QueryClientProvider client={queryClient}>
            <ClerkProvider {...pageProps}>
                <CustomThemeProvider>
                    <LXHThemeProvider>
                        <ApiClientProvider>
                            <LanguageProvider>
                                <LayoutProvider>
                                    <ModelProvider>
                                        <ConversationsProvider>
                                            <ConversationProvider value={conversationState}>
                                                    <TooltipProvider>
                                                        <ShortcutProvider>
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
                                                        </ShortcutProvider>
                                                    </TooltipProvider>
                                            </ConversationProvider>
                                        </ConversationsProvider>
                                    </ModelProvider>
                                </LayoutProvider>
                            </LanguageProvider>
                        </ApiClientProvider>
                    </LXHThemeProvider>
                </CustomThemeProvider>
            </ClerkProvider>
        </QueryClientProvider>
    ), [Component, pageProps, router, isRouterReady, queryClient, conversationState]);

    return providedContent;
}

export default MyApp;