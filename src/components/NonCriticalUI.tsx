'use client';

import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';

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

export function NonCriticalUI({ children }: { children: ReactNode }) {
  return (
    <>
      <ClientVersionCheck />
      <Toaster />
      <GlobalErrorHandler />
      <SpeedInsights />
      <Analytics />
      {children}
    </>
  );
}
