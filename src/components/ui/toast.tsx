import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toastsState: ToastItem[] = [];
const listeners = new Set<ToastListener>();

const notify = () => {
  listeners.forEach((listener) => listener([...toastsState]));
};

export const toast = {
  show: (message: string, options?: { type?: ToastType; title?: string; duration?: number }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = options?.duration ?? 4000;
    const newToast: ToastItem = {
      id,
      type: options?.type || "info",
      message,
      title: options?.title,
      duration,
    };

    // Keep up to 4 toasts visible simultaneously
    toastsState = [newToast, ...toastsState.slice(0, 3)];
    notify();

    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, duration);
    }
    return id;
  },

  success: (message: string, title?: string, duration?: number) => {
    return toast.show(message, { type: "success", title, duration });
  },

  error: (message: string, title?: string, duration?: number) => {
    return toast.show(message, { type: "error", title: title || "Error", duration });
  },

  info: (message: string, title?: string, duration?: number) => {
    return toast.show(message, { type: "info", title, duration });
  },

  warning: (message: string, title?: string, duration?: number) => {
    return toast.show(message, { type: "warning", title: title || "Notice", duration });
  },

  dismiss: (id: string) => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notify();
  },

  clear: () => {
    toastsState = [];
    notify();
  },
};

export const Toaster: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>(toastsState);

  useEffect(() => {
    const handler: ToastListener = (newToasts) => {
      setItems(newToasts);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return (
    <div
      aria-live="assertive"
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] sm:w-96 pointer-events-none"
    >
      <AnimatePresence mode="sync">
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95, x: 25 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 35 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
              t.type === "success"
                ? "bg-background/95 border-emerald-500/40 text-foreground"
                : t.type === "error"
                ? "bg-background/95 border-destructive/40 text-foreground"
                : t.type === "warning"
                ? "bg-background/95 border-amber-500/40 text-foreground"
                : "bg-background/95 border-border/80 text-foreground"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-destructive" />}
              {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {t.type === "info" && <Info className="w-5 h-5 text-primary" />}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              {t.title && (
                <p className="text-sm font-semibold text-foreground tracking-tight mb-0.5">
                  {t.title}
                </p>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground leading-snug break-words font-medium">
                {t.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="shrink-0 p-1 rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
