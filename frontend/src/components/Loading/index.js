import React from 'react';
import { Loader } from 'lucide-react';

export const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-primary-500 animate-spin-slow" />
    </div>
);

export const TableLoader = () => (
    <div className="p-4">
        <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        </div>
    </div>
);

export const ButtonLoader = ({ size = 'sm', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <Loader className={`${sizeClasses[size]} animate-spin ${className}`} />
    );
};

export const CardLoader = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
        </div>
    </div>
);