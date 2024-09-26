// src/app/layout.tsx

import type { Metadata } from "next";
import localFont from "next/font/local";
import "../../styles/globals.css";
import {ThemeProvider} from "@/components/ui/theme-provider";
import {LanguageProvider} from "@/components/LanguageProvider";
import {ClerkProvider} from "@clerk/nextjs";
import {Toaster} from "@/components/ui/toaster";
import GlobalErrorHandler from "@/api/GlobalErrorHandler";
import {ApiClientProvider} from "@/api/ApiClientProvider";
import useVersionCheck from "@/hooks/useVersionCheck";
import ClientVersionCheck from "@/components/ClientVersionCheck";
import seoDescription from "@/seo/seo_description";
import seoKeywords from "@/seo/seo_keywords";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

const Inter = localFont({
    src: "./fonts/InterDisplay-Medium.woff2",
    variable: "--font-inter",
    weight: "100 900",
});

const description = seoDescription;
const keywords = seoKeywords.join(',');

// TODO：之后记得补上
export const metadata: Metadata = {
    title: `Blur - Meet your mirror, your muse.`,
    description: description,
    keywords: keywords,
};


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <ClerkProvider>
            <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${Inter.variable} antialiased`}
            >
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <ClientVersionCheck/>
                <ApiClientProvider>
                <LanguageProvider>
                    <Toaster/>
                    <GlobalErrorHandler/>
                    {children}
                </LanguageProvider>
                </ApiClientProvider>
            </ThemeProvider>
            </body>
            </html>
        </ClerkProvider>
    );
}
