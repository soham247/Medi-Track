import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthController from '../controllers/AuthController';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const response = await AuthController.getCurrentUser();
            if (response.success) {
                setUser(response.data);
            } else {
                // If not successful, clean up the session
                handleLogout();
            }
        } catch (error) {
            console.error('Check user error:', error);
            // If we get an AppwriteException, we need to clean up the session
            if (error.message?.includes('missing scope') || 
                error.message?.includes('Invalid session')) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    }

    // Separate the logout cleanup from the API call
    const handleLogout = () => {
        setUser(null);
    };

    async function logout() {
        try {
            // Try to logout from Appwrite
            await AuthController.logout();
        } catch (error) {
            console.error('Logout error:', error);
            // Even if the server logout fails, we should still clean up locally
        } finally {
            // Always clean up the local session
            handleLogout();
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            loading,
            logout,
            checkUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);