import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { Search, Filter, Download, AlertCircle, CheckCircle, Clock, Truck, Package } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [savingId, setSavingId] = useState(null);

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
                setError('You do not have permission to view orders.');
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

    const updateStatus = async (orderId, status) => {
        try {
            setSavingId(orderId);
            await api.put(`/orders/${orderId}`, { status });
            fetchOrders();
        } catch (err) {
            alert('Failed to update order');
        } finally {
            setSavingId(null);
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'pending': return <Clock size={16} />;
            case 'processing': return <Package size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'completed': return <CheckCircle size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'completed': return 'bg-green-50 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const exportCsv = () => {
        const rows = [
            ['id', 'customer', 'phone', 'status', 'total', 'items'].join(','),
            ...filteredOrders.map((order) => {
                const itemCount = (order.orderItems || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                return [
                    order.id,
                    `"${String(order.contact_name || '').replace(/"/g, '""')}"`,
                    `"${String(order.contact_phone || '').replace(/"/g, '""')}"`,
                    order.status || '',
                    Number(order.total_price || 0).toFixed(2),
                    itemCount,
                ].join(',');
            }),
        ].join('\n');

        const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'orders.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const filteredOrders = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return orders.filter((order) => {
            const matchesStatus = statusFilter === 'all' ? true : String(order.status || '').toLowerCase() === statusFilter;
            const haystack = [order.id, order.contact_name, order.contact_phone, order.address, order.status]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            const matchesQuery = needle ? haystack.includes(needle) : true;
            return matchesStatus && matchesQuery;
        });
    }, [orders, query, statusFilter]);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="text-center">
                <div className="inline-block mb-4 animate-spin">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
                </div>
                <p className="text-gray-600">Loading orders...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Orders Management</h1>
                            <p className="text-gray-600 mt-2">Track, manage and update order statuses</p>
                        </div>
                        <button 
                            onClick={exportCsv}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by ID, name, phone, address..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                        </div>
                        <div className="relative">
                            <Filter size={18} className="absolute left-3 top-3 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none bg-white"
                            >
                                <option value="all">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <button 
                            onClick={() => { setQuery(''); setStatusFilter('all'); }} 
                            className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition border border-gray-300"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 border border-gray-200 text-center">
                        <Package size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 text-lg">No orders found</p>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const items = order.orderItems || [];
                            const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                            return (
                                <div key={order.id} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
                                    {/* Order Header */}
                                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg text-gray-900">Order #{order.id}</h3>
                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    <span className="capitalize">{order.status || 'pending'}</span>
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                                                <p><span className="font-medium">Customer:</span> {order.contact_name || 'N/A'}</p>
                                                <p><span className="font-medium">Phone:</span> {order.contact_phone || 'N/A'}</p>
                                                <p className="col-span-2"><span className="font-medium">Address:</span> {order.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right border-l border-gray-200 pl-6">
                                            <p className="text-3xl font-bold text-indigo-600">${Number(order.total_price || 0).toFixed(2)}</p>
                                            <p className="text-sm text-gray-500 mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                                            {order.payment_method && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    <span className="font-medium">Payment:</span> {order.payment_method}
                                                </p>
                                            )}
                                            {order.payment_id && (
                                                <p className="text-xs text-gray-400">
                                                    <span className="font-medium">ID:</span> {order.payment_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items & Actions */}
                                    <div className="p-6 grid md:grid-cols-2 gap-6">
                                        {/* Items List */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Package size={18} className="text-indigo-600" />
                                                Order Items
                                            </h4>
                                            <div className="space-y-2">
                                                {items.map((it) => (
                                                    <div key={it.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <span className="text-sm text-gray-800">
                                                            <span className="font-medium">{it.product?.name}</span>
                                                            <span className="text-gray-500 ml-2">x{it.quantity}</span>
                                                        </span>
                                                        <span className="font-semibold text-indigo-600">${Number(it.price || 0).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Clock size={18} className="text-amber-600" />
                                                Update Status
                                            </h4>
                                            <div className="space-y-2">
                                                {order.status !== 'processing' && (
                                                    <button 
                                                        disabled={savingId === order.id} 
                                                        onClick={() => updateStatus(order.id, 'processing')} 
                                                        className="w-full px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {savingId === order.id ? 'Updating...' : 'Mark as Processing'}
                                                    </button>
                                                )}
                                                {order.status !== 'shipped' && (
                                                    <button 
                                                        disabled={savingId === order.id} 
                                                        onClick={() => updateStatus(order.id, 'shipped')} 
                                                        className="w-full px-4 py-2.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {savingId === order.id ? 'Updating...' : 'Mark as Shipped'}
                                                    </button>
                                                )}
                                                {order.status !== 'completed' && (
                                                    <button 
                                                        disabled={savingId === order.id} 
                                                        onClick={() => updateStatus(order.id, 'completed')} 
                                                        className="w-full px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {savingId === order.id ? 'Updating...' : 'Mark as Completed'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
