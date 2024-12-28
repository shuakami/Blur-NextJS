'use client';

import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';
import {ThemeProvider} from "@/components/ui/theme-provider";
import {OptimizedClerkProvider} from "@/components/providers/OptimizedClerkProvider";
import { NonCriticalUI } from "@/components/NonCriticalUI";

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

const ShortcutProvider = dynamic(
  () => import('@/providers/ShortcutProvider').then(mod => mod.ShortcutProvider),
  { loading: () => null }
);

export function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <OptimizedClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className="antialiased" suppressHydrationWarning>
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
                                            <ShortcutProvider>
                                                <main>
                                                    {children}
                                                </main>
                                                <NonCriticalUI>
                                                    {null}
                                                </NonCriticalUI>
                                            </ShortcutProvider>
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