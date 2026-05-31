import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, t.duration || 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = t.type === 'success' ? CheckCircle :
                         t.type === 'error' ? XCircle :
                         t.type === 'warning' ? AlertTriangle : Info;

            const borderColor = t.type === 'success' ? 'border-l-green-500' :
                                t.type === 'error' ? 'border-l-red-500' :
                                t.type === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500';

            const iconColor = t.type === 'success' ? 'text-green-500' :
                              t.type === 'error' ? 'text-red-500' :
                              t.type === 'warning' ? 'text-amber-500' : 'text-blue-500';

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className={cn(
                  "bg-white border-y border-r border-l-4 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 text-sm min-w-[280px] pointer-events-auto",
                  borderColor
                )}
              >
                <Icon className={cn("w-5 h-5", iconColor)} />
                <span className="text-gray-800">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
