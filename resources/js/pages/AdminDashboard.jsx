import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ChevronDown, Plus, Edit, Trash2, Grid, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import AdminStats from '../components/AdminStats';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: null,
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/products?per_page=100');
            setProducts(res.data.data || []);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Authentication required. Please log in again.');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to manage products.');
            } else {
                setError('Failed to load products. Please try again later.');
            }
            console.error('Failed to load products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data || []);
        } catch (err) {
            console.error('Failed to load categories:', err);
            if (err.response?.status === 401) {
                setError('Authentication required. Please log in again.');
            }
        }
    };

    const openAddCategoryModal = () => {
        setEditingCategory(null);
        setCategoryName('');
        setShowCategoryModal(true);
    };

    const openEditCategoryModal = (cat) => {
        setEditingCategory(cat);
        setCategoryName(cat.name);
        setShowCategoryModal(true);
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, { name: categoryName });
            } else {
                await api.post('/categories', { name: categoryName });
            }
            setShowCategoryModal(false);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save category');
        }
    };

    const handleCategoryDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', description: '', price: '', stock: '', category_id: '', image: null });
        setPreviewUrl(null);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            category_id: product.category_id,
            image: null,
        });
        setPreviewUrl(product.image ? `/storage/${product.image}` : null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingProduct) {
                data.append('_method', 'PUT');
                await api.post(`/products/${editingProduct.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(' ')
                : 'Failed to save product';
            alert(msg);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="text-center">
                <div className="inline-block mb-4 animate-spin">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
                </div>
                <p className="text-gray-600">Loading dashboard...</p>
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
                            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600 mt-2">Manage products and categories efficiently</p>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button
                                onClick={openAddCategoryModal}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
                            >
                                <Plus size={18} />
                                Add Category
                            </button>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                            >
                                <Plus size={18} />
                                Add Product
                            </button>
                            <a href="/admin/orders" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg">
                                View Orders
                            </a>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <AdminStats />

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Categories Section */}
                {categories.length > 0 && (
                    <div className="mb-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Grid size={20} className="text-indigo-600" />
                            Categories ({categories.length})
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {categories.map((cat) => (
                                <div key={cat.id} className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg flex items-center gap-3 hover:shadow-md transition-shadow">
                                    <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => openEditCategoryModal(cat)} 
                                            className="text-indigo-600 hover:text-indigo-700 text-xs font-medium hover:underline"
                                        >
                                            <Edit size={14} className="inline" />
                                        </button>
                                        <button 
                                            onClick={() => handleCategoryDelete(cat.id)} 
                                            className="text-red-600 hover:text-red-700 text-xs font-medium hover:underline"
                                        >
                                            <Trash2 size={14} className="inline" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Section */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Grid size={20} className="text-indigo-600" />
                        Products ({products.length})
                    </h2>
                    {products.length === 0 ? (
                        <div className="text-center py-16">
                            <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 text-lg">No products found</p>
                            <p className="text-gray-400 text-sm mt-2">Create your first product to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                                    {/* Image Container */}
                                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                        {product.image ? (
                                            <img 
                                                src={`/storage/${product.image}`} 
                                                alt={product.name} 
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <ImageIcon size={40} className="text-gray-400" />
                                            </div>
                                        )}
                                        {product.stock <= 5 && (
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                                Low Stock
                                            </div>
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 truncate text-sm">{product.name}</h3>
                                        <p className="text-xs text-indigo-600 mt-1">{product.category?.name || 'No Category'}</p>
                                        <div className="mt-3 flex items-baseline justify-between">
                                            <p className="text-lg font-bold text-indigo-600">${parseFloat(product.price).toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button 
                                                onClick={() => openEditModal(product)} 
                                                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product.id)} 
                                                className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 border-b border-indigo-100">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {editingProduct ? (
                                        <>
                                            <Edit size={24} />
                                            Edit Product
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={24} />
                                            Add New Product
                                        </>
                                    )}
                                </h3>
                            </div>

                            {/* Modal Content */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                            placeholder="Enter product name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <div
                                        contentEditable
                                        onInput={(e) => setFormData({ ...formData, description: e.currentTarget.innerHTML })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
                                        dangerouslySetInnerHTML={{ __html: formData.description || '' }}
                                        suppressContentEditableWarning
                                    />
                                    <p className="text-xs text-gray-500 mt-2">💡 You can use basic formatting here</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Product Image</label>
                                    {previewUrl && (
                                        <div className="mb-4 relative">
                                            <img src={previewUrl} alt="preview" className="h-40 w-full object-cover rounded-lg border-2 border-indigo-200" />
                                            <button
                                                type="button"
                                                onClick={() => { setPreviewUrl(null); setFormData({ ...formData, image: null }); }}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                    <div
                                        className="w-full border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
                                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-indigo-200'); }}
                                        onDragLeave={(e) => { e.currentTarget.classList.remove('bg-indigo-200'); }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.remove('bg-indigo-200');
                                            const file = e.dataTransfer.files[0];
                                            setFormData({ ...formData, image: file });
                                            if (file) setPreviewUrl(URL.createObjectURL(file));
                                        }}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                setFormData({ ...formData, image: file });
                                                if (file) setPreviewUrl(URL.createObjectURL(file));
                                            }}
                                            className="hidden"
                                            id="image-input"
                                        />
                                        <label htmlFor="image-input" className="cursor-pointer">
                                            <div className="text-2xl mb-2">📸</div>
                                            <p className="font-medium text-gray-700">Drag and drop your image here</p>
                                            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                                        </label>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition shadow-md hover:shadow-lg"
                                    >
                                        {editingProduct ? 'Update Product' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Category Modal */}
                {showCategoryModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 border-b border-amber-100">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {editingCategory ? (
                                        <>
                                            <Edit size={24} />
                                            Edit Category
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={24} />
                                            New Category
                                        </>
                                    )}
                                </h3>
                            </div>

                            {/* Modal Content */}
                            <form onSubmit={handleCategorySubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name</label>
                                    <input
                                        type="text"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                                        placeholder="Enter category name"
                                        required
                                    />
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCategoryModal(false)} 
                                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition shadow-md hover:shadow-lg"
                                    >
                                        {editingCategory ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
