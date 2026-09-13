import React, { createContext, useContext, useState, useCallback } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('ems_user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = useCallback(async (email, password) => {
        const response = await AuthService.login(email, password);
        const { token, email: userEmail, role } = response.data;
        localStorage.setItem('ems_token', token);
        localStorage.setItem('ems_user', JSON.stringify({ email: userEmail, role }));
        setUser({ email: userEmail, role });
        return { email: userEmail, role };
    }, []);

    const register = useCallback(async (name, email, password) => {
        const response = await AuthService.register(name, email, password);
        const { token, email: userEmail, role } = response.data;
        localStorage.setItem('ems_token', token);
        localStorage.setItem('ems_user', JSON.stringify({ email: userEmail, role }));
        setUser({ email: userEmail, role });
        return { email: userEmail, role };
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('ems_token');
        localStorage.removeItem('ems_user');
        setUser(null);
    }, []);

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
