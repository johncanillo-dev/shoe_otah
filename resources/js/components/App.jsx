import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { ToastProvider } from './Toast';
import Home from '../pages/Home';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminDashboard from '../pages/AdminDashboard';
import AdminOrders from '../pages/AdminOrders';
import CustomerDashboard from '../pages/CustomerDashboard';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

const AppRoutes = () => {
    const location = useLocation();
    return (
        <Routes key={location.pathname} location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><CustomerDashboard /></PrivateRoute>} />
        </Routes>
    );
};

const App = () => {
    return (
        <ToastProvider>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto px-4 py-6">
                    <AppRoutes />
                </main>
            </div>
        </ToastProvider>
    );
};

export default App;
