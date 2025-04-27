import { useEffect } from 'react';
import { useToastStore } from './use-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export function Toast() {
  const { toast, hideToast } = useToastStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start pt-4 px-4"
        >
          <div
            className={`
              w-[85%] sm:w-auto sm:min-w-[300px] sm:max-w-[360px] rounded-lg shadow-lg 
              bg-opacity-85 backdrop-blur-sm
              ${toast.variant === 'destructive' 
                ? 'bg-red-400 text-white' 
                : 'bg-emerald-400 text-white'
              }
            `}
          >
            <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-xs font-medium mb-0.5">{toast.title}</p>
                {toast.description && (
                  <p className="text-[11px] sm:text-xs opacity-90">{toast.description}</p>
                )}
              </div>
              <button
                onClick={hideToast}
                className="shrink-0 rounded-md p-1 hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 