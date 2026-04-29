import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return user && isAdmin() ? children : <Navigate to="/" replace />;
};

export default AdminRoute;

