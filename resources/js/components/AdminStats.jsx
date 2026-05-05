import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, ShoppingCart, Package, DollarSign, Users, Clock } from 'lucide-react';

const AdminStats = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCategories: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                const [productsRes, ordersRes, categoriesRes] = await Promise.all([
                    api.get('/products?per_page=100').catch(() => ({ data: { data: [] } })),
                    api.get('/orders').catch(() => ({ data: [] })),
                    api.get('/categories').catch(() => ({ data: [] })),
                ]);

                const products = productsRes.data.data || [];
                const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
                const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

                const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
                const pendingOrders = orders.filter(order => order.status === 'pending').length;
                const lowStockProducts = products.filter(p => p.stock <= 5).length;

                setStats({
                    totalProducts: products.length,
                    totalOrders: orders.length,
                    totalRevenue,
                    totalCategories: categories.length,
                    pendingOrders,
                    lowStockProducts,
                });
            } catch (err) {
                console.error('Failed to load stats:', err);
                // Set default stats on error
                setStats({
                    totalProducts: 0,
                    totalOrders: 0,
                    totalRevenue: 0,
                    totalCategories: 0,
                    pendingOrders: 0,
                    lowStockProducts: 0,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-90">{label}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <Icon size={40} className="opacity-20" />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={24} className="text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    icon={Package}
                    label="Total Products"
                    value={stats.totalProducts}
                    color="from-blue-500 to-blue-600"
                />
                <StatCard
                    icon={ShoppingCart}
                    label="Total Orders"
                    value={stats.totalOrders}
                    color="from-indigo-500 to-indigo-600"
                />
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`$${stats.totalRevenue.toFixed(2)}`}
                    color="from-green-500 to-green-600"
                />
                <StatCard
                    icon={Users}
                    label="Categories"
                    value={stats.totalCategories}
                    color="from-purple-500 to-purple-600"
                />
                <StatCard
                    icon={Clock}
                    label="Pending Orders"
                    value={stats.pendingOrders}
                    color="from-yellow-500 to-yellow-600"
                />
                <StatCard
                    icon={Package}
                    label="Low Stock Items"
                    value={stats.lowStockProducts}
                    color="from-red-500 to-red-600"
                />
            </div>
        </div>
    );
};

export default AdminStats;
