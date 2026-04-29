import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
    const { user, loading } = useAuth();

    // Fetch cart only when user is authenticated
    useEffect(() => {
        if (!loading && user) {
            fetchCart();
        } else if (!loading && !user) {
            // Clear cart if user logs out
            setCartItems([]);
            setCartTotal(0);
        }
    }, [user, loading]);

    const fetchCart = async () => {
        try {
            const res = await api.get('/cart');
            setCartItems(res.data.items || []);
            setCartTotal(res.data.total || 0);
        } catch (err) {
            if (err.response?.status === 401) {
                // User not authenticated, clear cart
                setCartItems([]);
                setCartTotal(0);
            } else {
                console.error('Failed to fetch cart', err);
            }
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        await api.post('/cart', { product_id: productId, quantity });
        await fetchCart();
    };

    const updateQuantity = async (productId, quantity) => {
        await api.put(`/cart/${productId}`, { quantity });
        await fetchCart();
    };

    const removeFromCart = async (productId) => {
        await api.delete(`/cart/${productId}`);
        await fetchCart();
    };

    const clearCart = async () => {
        await api.delete('/cart');
        setCartItems([]);
        setCartTotal(0);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            cartTotal, 
            cartCount, 
            paymentMethod, 
            setPaymentMethod, 
            addToCart, 
            updateQuantity, 
            removeFromCart, 
            clearCart, 
            fetchCart 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

