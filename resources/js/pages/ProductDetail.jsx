import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../contexts/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [added, setAdded] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);
        } catch (err) {
            setError('Product not found');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        await addToCart(product.id, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <button onClick={() => navigate(-1)} className="text-indigo-600 mb-4">← Back</button>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                    {product.image ? (
                        <img src={`/storage/${product.image}`} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                        <span className="text-gray-400">No Image</span>
                    )}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
                    <p className="text-gray-500 mt-1">{product.category?.name}</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-4">${parseFloat(product.price).toFixed(2)}</p>
                    <p className="text-gray-600 mt-4">{product.description || 'No description available.'}</p>
                    <p className="text-sm text-gray-500 mt-2">Stock: {product.stock}</p>

                    <div className="mt-6 flex items-center gap-4">
                        <div className="flex items-center border rounded-lg">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                            >-</button>
                            <span className="px-4">{quantity}</span>
                            <button
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                            >+</button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                        >
                            {added ? 'Added!' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;

