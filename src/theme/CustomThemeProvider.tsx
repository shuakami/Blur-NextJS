"use client";

import React, { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

interface CustomThemeProviderProps {
  children: ReactNode;
}

const CustomThemeProvider: React.FC<CustomThemeProviderProps> = React.memo(({ children }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {React.Children.only(children)}
    </NextThemesProvider>
  );
});

CustomThemeProvider.displayName = 'CustomThemeProvider';

export default CustomThemeProvider;