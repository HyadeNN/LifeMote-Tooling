import React from 'react';
import { X } from 'lucide-react';

const ALERT_TYPES = {
    error: 'bg-red-100 text-red-700 border-red-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
};

export const Alert = ({ type = 'info', message, onClose }) => {
    const alertClass = ALERT_TYPES[type];

    return (
        <div className={`${alertClass} border rounded-lg p-4 mb-4 flex justify-between items-center`}>
            <span>{message}</span>
            {onClose && (
                <button 
                    onClick={onClose}
                    className="ml-4 hover:opacity-75"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};