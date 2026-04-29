import React, { useState, useEffect } from 'react';
import api from '../api/axios';

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
        try {
            const res = await api.get('/products?per_page=100');
            setProducts(res.data.data || []);
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data || []);
        } catch (err) {
            console.error(err);
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

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                    <p className="text-sm text-gray-500">Manage products and categories</p>
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={openAddCategoryModal}
                        className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600"
                    >
                        Add Category
                    </button>
                    <button
                        onClick={openAddModal}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Add Product
                    </button>
                    <a href="/admin/orders" className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Orders</a>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h3 className="font-semibold mb-2">Categories</h3>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <div key={cat.id} className="px-3 py-1 bg-gray-100 rounded flex items-center gap-2">
                                <span className="text-sm">{cat.name}</span>
                                <button onClick={() => openEditCategoryModal(cat)} className="text-indigo-600 text-sm">Edit</button>
                                <button onClick={() => handleCategoryDelete(cat.id)} className="text-red-600 text-sm">Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                            <div className="h-40 bg-gray-100 flex items-center justify-center">
                                {product.image ? (
                                    <img src={`/storage/${product.image}`} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="text-gray-400">No Image</div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold truncate">{product.name}</h3>
                                <p className="text-sm text-gray-500">{product.category?.name}</p>
                                <p className="text-indigo-600 font-bold mt-2">${parseFloat(product.price).toFixed(2)}</p>
                                <p className="text-sm text-gray-500 mt-1">Stock: {product.stock}</p>
                                <div className="mt-3 flex gap-2">
                                    <button onClick={() => openEditModal(product)} className="px-3 py-1 bg-indigo-600 text-white rounded">Edit</button>
                                    <button onClick={() => handleDelete(product.id)} className="px-3 py-1 border rounded text-red-600">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {products.length === 0 && (
                    <p className="text-center text-gray-500 py-10">No products found.</p>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2 mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <div
                                    contentEditable
                                    onInput={(e) => setFormData({ ...formData, description: e.currentTarget.innerHTML })}
                                    className="w-full border rounded-lg px-4 py-2 mt-1 min-h-[80px] prose"
                                    dangerouslySetInnerHTML={{ __html: formData.description || '' }}
                                />
                                <p className="text-xs text-gray-400 mt-1">Simple rich text editor — formatting preserved as HTML.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2 mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2 mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2 mt-1"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image</label>
                                {previewUrl && (
                                    <div className="mb-2">
                                        <img src={previewUrl} alt="preview" className="h-32 w-32 object-cover rounded" />
                                    </div>
                                )}
                                <div
                                    className="w-full mt-1 border-dashed border-2 border-gray-200 rounded p-4 text-center"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
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
                                        className="w-full"
                                    />
                                    <div className="text-sm text-gray-500 mt-2">Drag & drop an image here, or click to choose</div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2 mt-1"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

