import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/Toast';

const Home = () => {
    const placeholderImage = '/images/product-placeholder.svg';
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addedToCart, setAddedToCart] = useState(null);
    const { addToCart } = useCart();
    const { addToast } = useToast();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, search]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data || []);
        } catch (err) {
            console.error(err);
            addToast('Failed to load categories', 'error');
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (selectedCategory) params.category = selectedCategory;
            if (search) params.search = search;

            const res = await api.get('/products', { params });
            setProducts(res.data.data || []);
        } catch (err) {
            setError('Failed to load products');
            addToast('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (e, productId, productName) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await addToCart(productId, 1);
            setAddedToCart(productId);
            addToast(`${productName} added to cart!`, 'success');
            setTimeout(() => setAddedToCart(null), 1500);
        } catch (err) {
            addToast('Failed to add to cart', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white">
                <h1 className="text-4xl font-bold mb-2">Welcome to Can-Mavs Boutique</h1>
                <p className="text-indigo-100">Discover our premium collection of products</p>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search products by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Category Tags */}
            {categories.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-4 py-2 rounded-full transition ${
                            selectedCategory === '' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full transition ${
                                selectedCategory === cat.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Products Grid */}
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="group bg-white rounded-lg shadow hover:shadow-xl transition-all overflow-hidden flex flex-col"
                        >
                            {/* Image Container */}
                            <div className="relative h-56 bg-gray-100 overflow-hidden">
                                {product.image ? (
                                    <img
                                        src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`}
                                        alt={product.name}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = placeholderImage;
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={placeholderImage}
                                        alt={product.name}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                )}
                                {product.stock < 5 && product.stock > 0 && (
                                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                        Only {product.stock} left
                                    </div>
                                )}
                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-1">
                                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-1">{product.category?.name}</p>
                                <h3 className="font-semibold text-gray-800 text-sm lg:text-base line-clamp-2 mb-2">{product.name}</h3>
                                {product.description && (
                                    <p className="text-gray-600 text-xs line-clamp-2 mb-2 flex-1">
                                        {product.description.replace(/<[^>]*>/g, '')}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mt-auto">
                                    <div>
                                        <p className="text-lg font-bold text-indigo-600">${parseFloat(product.price).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <div className="px-4 pb-4" onClick={(e) => e.preventDefault()}>
                                <button
                                    onClick={(e) => handleAddToCart(e, product.id, product.name)}
                                    disabled={product.stock === 0 || addedToCart === product.id}
                                    className={`w-full py-2 rounded-lg font-medium transition ${
                                        addedToCart === product.id
                                            ? 'bg-green-600 text-white'
                                            : product.stock === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                >
                                    {addedToCart === product.id ? '✓ Added' : 'Add to Cart'}
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No products found.</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
                </div>
            )}
        </div>
    );
};

export default Home;
