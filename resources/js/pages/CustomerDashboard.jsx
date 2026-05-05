import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view your orders.');
      } else {
        setError('Failed to load orders. Please try again later.');
      }
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-10">Loading your orders...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Your Orders</h2>
        <p className="text-gray-600 mt-2">Track the status of your recent purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500">Your orders will appear here once you make a purchase.</p>
          <a href="/" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const items = order.orderItems || [];
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">Order #{order.id}</h3>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide
                          ${order.status === 'pending' && 'bg-yellow-100 text-yellow-800'}
                          ${order.status === 'processing' && 'bg-blue-100 text-blue-800'}
                          ${order.status === 'shipped' && 'bg-indigo-100 text-indigo-800'}
                          ${order.status === 'completed' && 'bg-green-100 text-green-800'}
                          ${order.status === 'cancelled' && 'bg-red-100 text-red-800'}
                        `}
                      >
                        {order.status || 'pending'}
                      </span>
                    </div>
                    <p className="text-lg text-gray-700 mb-1">{order.contact_name} · {order.contact_phone}</p>
                    <p className="text-gray-600 mb-4">{order.address}</p>
                    <p className="text-sm text-gray-500">{items.length} item(s) · Ordered on {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">${Number(order.total_price || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-1">Payment: {order.payment_method || 'N/A'}</p>
                    {order.payment_id && (
                      <p className="text-sm text-gray-500">ID: {order.payment_id}</p>
                    )}
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h4 className="text-lg font-semibold mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{item.product?.name}</p>
                          <p className="text-sm text-gray-500">x{item.quantity}</p>
                        </div>
                        <p className="font-semibold">${Number(item.price * item.quantity || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
