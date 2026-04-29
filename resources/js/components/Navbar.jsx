import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                    Shoe-Otah Boutique
                </Link>
                <div className="flex items-center space-x-4">
                    {!isAuthPage && (
                        <>
                            <Link to="/" className="text-gray-700 hover:text-indigo-600">Shop</Link>
                            <Link to="/cart" className="text-gray-700 hover:text-indigo-600 relative">
                                Cart
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            {user && !isAdmin() && (
                                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
                            )}
                        </>
                    )}
                    {isAdmin() && (
                        <Link to="/admin" className="text-gray-700 hover:text-indigo-600">Admin</Link>
                    )}
                    {user ? (
                        <>
                            <span className="text-gray-600">{user.name}</span>
                            <button onClick={handleLogout} className="text-gray-700 hover:text-red-600">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-700 hover:text-indigo-600">Login</Link>
                            <Link to="/register" className="text-gray-700 hover:text-indigo-600">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
