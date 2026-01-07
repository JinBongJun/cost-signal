'use client';

import { useCallback, useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  return {
    toasts,
    removeToast,
    show,
    success: (message: string) => show('success', message),
    error: (message: string) => show('error', message),
    info: (message: string) => show('info', message),
    warning: (message: string) => show('warning', message),
  };
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (!toasts || toasts.length === 0) return null;

  const typeStyles: Record<ToastType, string> = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-amber-500 text-white',
  };

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex flex-col items-center space-y-2 px-4 md:items-end md:pr-8 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto max-w-md w-full md:w-auto rounded-xl shadow-lg px-4 py-3 text-sm md:text-base flex items-start gap-3 animate-slide-up ${typeStyles[toast.type]}`}
        >
          <div className="flex-1 break-words">{toast.message}</div>
          <button
            type="button"
            onClick={() => onClose(toast.id)}
            className="ml-2 text-xs opacity-80 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}


