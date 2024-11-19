// src/app/layout.tsx

import type { Metadata } from "next";
import dynamic from 'next/dynamic';
import "../../styles/globals.css";
import {ThemeProvider} from "@/components/ui/theme-provider";
import {OptimizedClerkProvider} from "@/components/providers/OptimizedClerkProvider";
import seoDescription from "@/seo/seo_description";
import seoKeywords from "@/seo/seo_keywords";

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then(mod => mod.SpeedInsights),
  { ssr: false, loading: () => null }
);

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(mod => mod.Analytics),
  { ssr: false, loading: () => null }
);

const ClientVersionCheck = dynamic(
  () => import('@/components/ClientVersionCheck'),
  { ssr: false, loading: () => null }
);

const Toaster = dynamic(
  () => import('@/components/ui/toaster').then(mod => mod.Toaster),
  { ssr: false, loading: () => null }
);

const GlobalErrorHandler = dynamic(
  () => import('@/api/GlobalErrorHandler'),
  { ssr: false, loading: () => null }
);

const LanguageProvider = dynamic(
  () => import('@/components/LanguageProvider').then(mod => mod.LanguageProvider),
  { loading: () => null }
);

const ApiClientProvider = dynamic(
  () => import('@/api/ApiClientProvider').then(mod => mod.ApiClientProvider),
  { loading: () => null }
);

const ModelProvider = dynamic(
  () => import('@/components/ui/model_selector').then(mod => mod.ModelProvider),
  { loading: () => null }
);

const LXHThemeProvider = dynamic(
  () => import('@/theme/ThemeContext').then(mod => mod.LXHThemeProvider),
  { loading: () => null }
);

const TooltipProvider = dynamic(
  () => import('@/components/ui/tooltip').then(mod => mod.TooltipProvider),
  { loading: () => null }
);

// SEO
const description = seoDescription;
const keywords = seoKeywords.join(',');

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
};

export const metadata: Metadata = {
    title: `Blur - Meet your mirror, your muse.`,
    description,
    keywords,
    openGraph: {
        title: 'Blur - Meet your mirror, your muse.',
        description,
        type: 'website',
    },
};

const NonCriticalUI = dynamic(() => 
  Promise.resolve().then(() => {
    const NonCriticalUI = ({ children }: { children: React.ReactNode }) => (
      <>
        <ClientVersionCheck />
        <Toaster />
        <GlobalErrorHandler />
        <SpeedInsights />
        <Analytics />
        {children}
      </>
    );
    return { default: NonCriticalUI };
  }),
  { ssr: false, loading: () => null }
);

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <OptimizedClerkProvider>
            <html lang="en">
            <body className="antialiased">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <LXHThemeProvider>
                        <ModelProvider>
                            <ApiClientProvider>
                                <LanguageProvider>
                                    <TooltipProvider>
                                        <main>
                                            {children}
                                        </main>
                                        <NonCriticalUI>
                                            {null}
                                        </NonCriticalUI>
                                    </TooltipProvider>
                                </LanguageProvider>
                            </ApiClientProvider>
                        </ModelProvider>
                    </LXHThemeProvider>
                </ThemeProvider>
            </body>
            </html>
        </OptimizedClerkProvider>
    );
}
