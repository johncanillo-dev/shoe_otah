import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
    const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add some items to get started!</p>
                <Link to="/" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h2>
                    
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.product.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                    <div className="h-24 w-24 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                                        {item.product.image ? (
                                            <img
                                                src={`/storage/${item.product.image}`}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="flex-1">
                                    <Link to={`/product/${item.product.id}`} className="hover:text-indigo-600">
                                        <h3 className="font-semibold text-gray-800 text-lg">{item.product.name}</h3>
                                    </Link>
                                    <p className="text-gray-600 text-sm mt-1">{item.product.category?.name}</p>
                                    <p className="text-indigo-600 font-bold text-lg mt-2">${parseFloat(item.product.price).toFixed(2)}</p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200 transition"
                                        title="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200 transition"
                                        title="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Price and Remove */}
                                <div className="text-right">
                                    <p className="font-bold text-lg text-gray-800">${(item.product.price * item.quantity).toFixed(2)}</p>
                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium mt-2 transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex gap-4">
                        <Link to="/" className="flex-1 text-center text-gray-600 hover:text-gray-800 py-3 border border-gray-300 rounded-lg transition font-medium">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>

                    {/* Items List */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 max-h-80 overflow-y-auto">
                        {cartItems.map((item) => (
                            <div key={item.product.id} className="flex justify-between text-sm">
                                <div>
                                    <p className="font-medium text-gray-800">{item.product.name}</p>
                                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-gray-800">${(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span>${parseFloat(cartTotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping:</span>
                            <span className="text-green-600 font-medium">FREE</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax:</span>
                            <span>$0.00</span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800">Total:</span>
                            <span className="text-2xl font-bold text-indigo-600">${parseFloat(cartTotal).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                        onClick={() => user ? navigate('/checkout') : navigate('/login')}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-bold text-lg mb-3"
                    >
                        Proceed to Checkout
                    </button>

                    {!user && (
                        <p className="text-center text-sm text-gray-600">
                            or <Link to="/login" className="text-indigo-600 hover:underline font-medium">sign in</Link> to your account
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;

