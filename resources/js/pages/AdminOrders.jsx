import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [savingId, setSavingId] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders');
            setOrders(res.data || []);
        } catch (err) {
            setError('Failed to load orders');
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

    if (loading) return <div className="text-center py-10">Loading orders...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold">Orders</h2>
                    <p className="text-sm text-gray-500">Search, filter, and manage order status.</p>
                </div>
                <button onClick={exportCsv} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black">
                    Export CSV
                </button>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by customer, phone, address..."
                    className="border rounded-lg px-4 py-2"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <button onClick={() => { setQuery(''); setStatusFilter('all'); }} className="border rounded-lg px-4 py-2 hover:bg-gray-50">
                    Reset
                </button>
            </div>

            <div className="space-y-4">
                {filteredOrders.map((order) => {
                    const items = order.orderItems || [];
                    return (
                        <div key={order.id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
                            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                                        <span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                            {order.status || 'pending'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{order.contact_name} · {order.contact_phone}</p>
                                    <p className="text-sm text-gray-500">{order.address}</p>
                                    <p className="text-sm text-gray-400 mt-2">{items.length} items</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-xl">${Number(order.total_price || 0).toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">Payment: {order.payment_method || 'N/A'}</p>
                                    <p className="text-sm text-gray-500">Payment ID: {order.payment_id || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mt-4 grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-2">Items</h4>
                                    <ul className="space-y-2 text-sm">
                                        {items.map((it) => (
                                            <li key={it.id} className="flex justify-between border-b pb-2 last:border-0">
                                                <span>{it.product?.name} x {it.quantity}</span>
                                                <span>${Number(it.price || 0).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Actions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <button disabled={savingId === order.id} onClick={() => updateStatus(order.id, 'processing')} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                                            Processing
                                        </button>
                                        <button disabled={savingId === order.id} onClick={() => updateStatus(order.id, 'shipped')} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                            Mark Shipped
                                        </button>
                                        <button disabled={savingId === order.id} onClick={() => updateStatus(order.id, 'completed')} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                                            Complete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredOrders.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
                        No orders match your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
