// src/app/layout.tsx

import type { Metadata } from "next";
import '@/styles/globals.css';
import seoDescription from "@/seo/seo_description";
import seoKeywords from "@/seo/seo_keywords";
import { ClientLayout } from "@/components/ClientLayout";

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <ClientLayout>{children}</ClientLayout>;
}
