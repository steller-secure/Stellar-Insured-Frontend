"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { cn, staticSurfaceRecipe } from "@/design-system";
import type { UIColor } from "@/design-system";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideToast(id);
    }, 5000);
  }, [hideToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed right-4 bottom-4 z-70 flex w-full max-w-sm flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Toast types map onto the shared semantic colours. */
const TOAST_COLORS: Record<ToastType, UIColor> = {
  success: "success",
  error: "error",
  info: "info",
  warning: "warning",
};

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const color = TOAST_COLORS[toast.type];
  const Icon = icons[toast.type];

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={cn(
        "flex items-center gap-3 rounded-card border border-current/20 p-4",
        "animate-slide-in-right shadow-elevation-3 backdrop-blur-md motion-reduce:animate-none",
        staticSurfaceRecipe.soft[color],
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-70 transition-opacity duration-200 ease-standard hover:opacity-100"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
