import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/Toast';
import api from '../api/axios';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart, paymentMethod, setPaymentMethod } = useCart();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirm
    const [form, setForm] = useState({
        contact_name: '',
        address: '',
        contact_phone: '',
        payment_method: paymentMethod,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Sync form payment method with context
    useEffect(() => {
        setForm(prev => ({ ...prev, payment_method: paymentMethod }));
    }, [paymentMethod]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        setForm({ ...form, payment_method: method });
    };

    const validateShippingStep = () => {
        if (!form.contact_name.trim()) {
            setError('Full Name is required');
            addToast('Full Name is required', 'error');
            return false;
        }
        if (!form.address.trim()) {
            setError('Address is required');
            addToast('Address is required', 'error');
            return false;
        }
        if (!form.contact_phone.trim()) {
            setError('Phone Number is required');
            addToast('Phone Number is required', 'error');
            return false;
        }
        setError('');
        return true;
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (validateShippingStep()) {
                setStep(2);
            }
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handlePrevStep = () => {
        if (step > 1) {
            setStep(step - 1);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        addToast('Processing your order...', 'info', 5000);

        try {
            await api.post('/orders', form);
            setSuccess(true);
            clearCart();
            addToast('Order placed successfully! 🎉', 'success');
            setTimeout(() => navigate('/'), 2500);
        } catch (err) {
            let errorMsg = 'Failed to place order';
            if (err.response?.status === 401) {
                errorMsg = 'Authentication required. Please log in again.';
            } else if (err.response?.status === 403) {
                errorMsg = 'You do not have permission to place orders.';
            } else if (err.response?.status === 400) {
                errorMsg = err.response?.data?.message || 'Invalid order data. Please check your information.';
            } else {
                errorMsg = err.response?.data?.message || 'Failed to place order. Please try again later.';
            }
            setError(errorMsg);
            addToast(errorMsg, 'error');
            console.error('Failed to place order:', err);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-5xl mb-4">✓</div>
                <h2 className="text-3xl font-bold text-green-600 mb-2">Order Placed!</h2>
                <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
                <p className="text-sm text-gray-500">Redirecting to home page...</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500 mb-4">Your cart is empty.</p>
                <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Continue Shopping</button>
            </div>
        );
    }

    const paymentMethods = [
        { id: 'cash_on_delivery', label: 'Cash on Delivery', description: 'Pay when you receive your order' },
        { id: 'card', label: 'Credit/Debit Card', description: 'Pay securely with your card' },
        { id: 'bank_transfer', label: 'Bank Transfer', description: 'Direct bank transfer' },
    ];

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex justify-between">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center flex-1">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                                        s <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {s}
                                    </div>
                                    {s < 3 && <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-600">
                            <span>Shipping</span>
                            <span>Payment</span>
                            <span>Confirm</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Shipping Information */}
                    {step === 1 && (
                        <form className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Information</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="contact_name"
                                    value={form.contact_name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                <textarea
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Street address, city, state"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="contact_phone"
                                    value={form.contact_phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </form>
                    )}

                    {/* Step 2: Payment Method */}
                    {step === 2 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h3>
                            <div className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <label key={method.id} className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                                           style={{
                                               borderColor: form.payment_method === method.id ? '#4f46e5' : undefined,
                                               backgroundColor: form.payment_method === method.id ? '#eef2ff' : undefined
                                           }}>
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value={method.id}
                                            checked={form.payment_method === method.id}
                                            onChange={() => handlePaymentMethodChange(method.id)}
                                            className="mt-1 mr-3"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800">{method.label}</p>
                                            <p className="text-sm text-gray-600">{method.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirm Order */}
                    {step === 3 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Your Order</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-800 mb-2">Shipping To:</h4>
                                    <p className="text-gray-700">{form.contact_name}</p>
                                    <p className="text-gray-600 text-sm whitespace-pre-line">{form.address}</p>
                                    <p className="text-gray-600 text-sm">{form.contact_phone}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-800 mb-2">Payment Method:</h4>
                                    <p className="text-gray-700">{paymentMethods.find(m => m.id === form.payment_method)?.label}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-8">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handlePrevStep}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                            >
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
                    <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                        {cartItems.map((item) => (
                            <div key={item.product.id} className="flex justify-between items-start gap-2 pb-3 border-b border-gray-100">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{item.product.name}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-gray-800">${(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t-2 border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-gray-800">${parseFloat(cartTotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="text-gray-800">FREE</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold bg-gray-50 p-3 rounded-lg">
                            <span>Total:</span>
                            <span className="text-indigo-600">${parseFloat(cartTotal).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

