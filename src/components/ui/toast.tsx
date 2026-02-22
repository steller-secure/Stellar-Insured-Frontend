"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

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
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    info: <Info className="h-5 w-5 text-sky-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
  };

  const bgColors = {
    success: "bg-green-500/10 border-green-500/20",
    error: "bg-red-500/10 border-red-500/20",
    info: "bg-sky-500/10 border-sky-500/20",
    warning: "bg-yellow-500/10 border-yellow-500/20",
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md animate-in slide-in-from-right fade-in duration-300 ${bgColors[toast.type]}`}>
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 text-sm font-medium text-white">{toast.message}</div>
      <button 
        onClick={onClose}
        className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
