// ToastContext.tsx
import React, { createContext, useContext, useState } from 'react';
import Toast from './Toast';

interface ToastContextType {
    addToast: (message: string, icon: JSX.Element) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<{ id: number; message: string; icon: JSX.Element }[]>([]);
    const [nextId, setNextId] = useState(0);

    const addToast = (message: string, icon: JSX.Element) => {
        setToasts((prev) => [...prev, { id: nextId, message, icon }]);
        setNextId((prev) => prev + 1);
    };

    const dismissToast = (id: number) => {
        setToasts((prev) => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-0 right-0 p-4 space-y-2 z-50">
                {toasts.map((toast) => (
                    <Toast key={toast.id} id={toast.id} message={toast.message} icon={toast.icon} onDismiss={dismissToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
