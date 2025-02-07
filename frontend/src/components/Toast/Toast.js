import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastItem = ({ message, type, onClose }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const styles = {
        success: 'border-green-200 bg-green-50',
        error: 'border-red-200 bg-red-50',
        warning: 'border-yellow-200 bg-yellow-50',
        info: 'border-blue-200 bg-blue-50'
    };

    return (
        <div className={`flex items-center w-full max-w-sm p-4 mb-4 rounded-lg shadow border ${styles[type]}`}>
            <div className="flex items-center space-x-3">
                {icons[type]}
                <p className="text-sm font-normal">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = ({ message, type = 'info', duration = 5000 }) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };

    // Global erişim için
    useEffect(() => {
        window.showToast = showToast;
        return () => {
            delete window.showToast;
        };
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="fixed top-4 right-4 z-50">
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};