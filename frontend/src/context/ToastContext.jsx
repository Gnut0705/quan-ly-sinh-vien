import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type = 'info', message, duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, type, message };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message, duration) => {
    showToast({ type: 'success', message, duration });
  }, [showToast]);

  const error = useCallback((message, duration) => {
    showToast({ type: 'error', message, duration });
  }, [showToast]);

  const info = useCallback((message, duration) => {
    showToast({ type: 'info', message, duration });
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    showToast({ type: 'warning', message, duration });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return context;
};
