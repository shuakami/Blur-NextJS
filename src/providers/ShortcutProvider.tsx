'use client'

import React, { createContext, useContext } from 'react'
import { useShortcuts } from '@/hooks/useShortcuts'
import type { ShortcutManager } from '@/types/shortcuts'

const ShortcutContext = createContext<ShortcutManager | null>(null)

export function ShortcutProvider({ children }: { children: React.ReactNode }) {
  const shortcutManager = useShortcuts()

  return (
    <ShortcutContext.Provider value={shortcutManager}>
      {children}
    </ShortcutContext.Provider>
  )
}

export function useShortcutManager() {
  const context = useContext(ShortcutContext)
  if (!context) {
    throw new Error('useShortcutManager must be used within ShortcutProvider')
  }
  return context
}