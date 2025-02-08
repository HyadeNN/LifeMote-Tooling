import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { serviceApi, createAuthenticatedApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const {
        isAuthenticated,
        loginWithRedirect,
        logout: auth0Logout,
        getAccessTokenSilently,
        user,
        isLoading,
    } = useAuth0();
    
    const [token, setToken] = useState(null);
    
    useEffect(() => {
        const getToken = async () => {
            if (isAuthenticated) {
                try {
                    const accessToken = await getAccessTokenSilently();
                    setToken(accessToken);
                    localStorage.setItem('token', accessToken);
                    // Update the API instance with the new token
                    Object.assign(serviceApi, createAuthenticatedApi(accessToken));
                } catch (err) {
                    console.error('Error getting token:', err);
                }
            }
        };
        
        getToken();
    }, [isAuthenticated, getAccessTokenSilently]);

    const logout = () => {
        localStorage.removeItem('token');
        auth0Logout({ returnTo: window.location.origin });
    };
    
    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                token,
                isLoading,
                login: loginWithRedirect,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};