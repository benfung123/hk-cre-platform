'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Toast variants for different message types
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        success: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100',
        error: 'border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100',
        warning: 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100',
        info: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// Toast context for programmatic usage
interface Toast {
  id: string
  title: string
  description?: string
  variant?: VariantProps<typeof toastVariants>['variant']
  duration?: number
  toastId?: string // Optional ID for deduplication
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Provider Component
interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    setToasts((prev) => {
      // If toast has a toastId, remove any existing toast with the same toastId
      let filtered = prev
      if (toast.toastId) {
        filtered = prev.filter((t) => t.toastId !== toast.toastId)
      }
      // Also limit total toasts to prevent stacking (max 3)
      if (filtered.length >= 3) {
        filtered = filtered.slice(-2) // Keep only the 2 most recent
      }
      return [...filtered, { ...toast, id }]
    })
    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

// Toast Viewport - fixed position container for all toasts
function ToastViewport() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Individual Toast Item
interface ToastItemProps {
  toast: Toast
  onDismiss: () => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, toast.duration || 3000)

    return () => clearTimeout(timer)
  }, [toast.duration, onDismiss])

  return (
    <div
      className={cn(
        toastVariants({ variant: toast.variant }),
        'animate-in slide-in-from-bottom-full fade-in duration-300'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="grid gap-1 flex-1">
        {toast.title && (
          <div className="text-sm font-semibold">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Hook for simpler toast API
export function useSimpleToast() {
  const { addToast } = useToast()

  return {
    success: (title: string, description?: string, duration?: number, toastId?: string) =>
      addToast({ title, description, variant: 'success', duration, toastId: toastId || 'success-toast' }),
    error: (title: string, description?: string, duration?: number, toastId?: string) =>
      addToast({ title, description, variant: 'error', duration, toastId: toastId || 'error-toast' }),
    warning: (title: string, description?: string, duration?: number, toastId?: string) =>
      addToast({ title, description, variant: 'warning', duration, toastId: toastId || 'warning-toast' }),
    info: (title: string, description?: string, duration?: number, toastId?: string) =>
      addToast({ title, description, variant: 'info', duration, toastId: toastId || 'info-toast' }),
    default: (title: string, description?: string, duration?: number, toastId?: string) =>
      addToast({ title, description, variant: 'default', duration, toastId }),
  }
}
