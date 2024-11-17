// src/app/layout.tsx

import type { Metadata } from "next";
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import localFont from "next/font/local";
import "../../styles/globals.css";
import {ThemeProvider} from "@/components/ui/theme-provider";
import {OptimizedClerkProvider} from "@/components/providers/OptimizedClerkProvider";
import seoDescription from "@/seo/seo_description";
import seoKeywords from "@/seo/seo_keywords";

// 动态导入非关键组件
const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then(mod => mod.SpeedInsights),
  { ssr: false }
);

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(mod => mod.Analytics),
  { ssr: false }
);

const ClientVersionCheck = dynamic(
  () => import('@/components/ClientVersionCheck'),
  { ssr: false }
);

const Toaster = dynamic(
  () => import('@/components/ui/toaster').then(mod => mod.Toaster),
  { ssr: false }
);

const GlobalErrorHandler = dynamic(
  () => import('@/api/GlobalErrorHandler'),
  { ssr: false }
);

// 延迟加载的 Providers
const LanguageProvider = dynamic(
  () => import('@/components/LanguageProvider').then(mod => mod.LanguageProvider)
);

const ApiClientProvider = dynamic(
  () => import('@/api/ApiClientProvider').then(mod => mod.ApiClientProvider)
);

const ModelProvider = dynamic(
  () => import('@/components/ui/model_selector').then(mod => mod.ModelProvider)
);

const LXHThemeProvider = dynamic(
  () => import('@/theme/ThemeContext').then(mod => mod.LXHThemeProvider)
);

// Google Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// 本地字体使用 preload
const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
    preload: true,
    display: 'swap',
});

const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
    preload: true,
    display: 'swap',
});

const description = seoDescription;
const keywords = seoKeywords.join(',');

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
    title: `Blur - Meet your mirror, your muse.`,
    description,
    keywords,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <OptimizedClerkProvider>
            <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
            >
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
                                    <main>
                                        {children}
                                    </main>
                                    <ClientVersionCheck />
                                    <Toaster />
                                    <GlobalErrorHandler />
                                    <SpeedInsights />
                                    <Analytics />
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
