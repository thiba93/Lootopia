import { useState, useCallback } from 'react';
import { ToastProps } from '../components/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString();
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message: string) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  return {
    toasts,
    success,
    error,
    info,
    removeToast,
  };
};