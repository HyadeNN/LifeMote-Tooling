import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

export const ProfileMenu = () => {
    const { user, logout } = useAuth();
    
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
                {user?.picture ? (
                    <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                            {user?.name?.charAt(0)}
                        </span>
                    </div>
                )}
                <span className="text-sm font-medium truncate max-w-[120px]">
                    {user?.name}
                </span>
            </div>
            
            <button
                onClick={() => logout()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Sign Out"
            >
                <LogOut size={18} />
            </button>
        </div>
    );
};