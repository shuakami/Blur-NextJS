"use client"

import { type ToasterProps } from 'sonner'

export interface ToastProps extends ToasterProps {
  variant?: 'default' | 'destructive' | 'success' | 'info' | 'warning'
  acceptButton?: {
    label: string
    onClick: () => void
  }
  quitButton?: {
    label: string
    onClick: () => void
  }
}
