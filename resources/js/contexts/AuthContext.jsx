import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            api.get('/user')
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    delete api.defaults.headers.common['Authorization'];
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/login', { email, password });
            localStorage.setItem('token', res.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            setUser(res.data.user);
            return res.data;
        } catch (error) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                throw new Error(errors.email?.[0] || errors.password?.[0] || 'Login failed');
            }
            throw error;
        }
    };

    const register = async (name, email, password, password_confirmation) => {
        try {
            const res = await api.post('/register', {
                name,
                email,
                password,
                password_confirmation,
            });
            localStorage.setItem('token', res.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            setUser(res.data.user);
            return res.data;
        } catch (error) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                let msg = Object.values(errors).flat().join(', ');
                throw new Error(msg || 'Registration failed');
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            // ignore
        }
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const isAdmin = () => user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

