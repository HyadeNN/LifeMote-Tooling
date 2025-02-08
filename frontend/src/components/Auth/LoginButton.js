import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const LoginButton = () => {
    const { login } = useAuth();
    
    return (
        <button
            onClick={() => login()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
            Log In with Google
        </button>
    );
};


