import { useState, useEffect } from 'react';
import './ProductList.css';

const API_URL = 'http://localhost:8080/api';

function ProductList({ walletAddress, balance, onPurchaseComplete }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purchasingId, setPurchasingId] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handlePurchase = async (product) => {
        if (balance < product.price) {
            showNotification('Insufficient balance!', 'error');
            return;
        }

        if (product.stock === 0) {
            showNotification('Product out of stock!', 'error');
            return;
        }

        setPurchasingId(product.id);

        try {
            const response = await fetch(`${API_URL}/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: product.id,
                    buyer_address: walletAddress,
                    quantity: 1,
                }),
            });

            const data = await response.json();

            if (data.success) {
                showNotification(`✅ ${data.message}`, 'success');
                onPurchaseComplete(product.price);
                fetchProducts(); // Refresh products to update stock
            } else {
                showNotification(`❌ ${data.message}`, 'error');
            }
        } catch (err) {
            showNotification('Transaction failed!', 'error');
        } finally {
            setPurchasingId(null);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading products from blockchain...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3>Failed to load products</h3>
                <p>{error}</p>
                <button className="btn-primary" onClick={fetchProducts}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="product-list fade-in">
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="products-header">
                <h2>Available Products</h2>
                <p className="products-subtitle">
                    Browse our blockchain-verified digital products
                </p>
            </div>

            <div className="products-grid">
                {products.map((product) => (
                    <div key={product.id} className="product-card card">
                        <div className="product-image-container">
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="product-image"
                            />
                            <div className="product-stock-badge">
                                {product.stock > 0 ? (
                                    <span className="badge badge-success">
                                        {product.stock} in stock
                                    </span>
                                ) : (
                                    <span className="badge badge-danger">Out of stock</span>
                                )}
                            </div>
                        </div>

                        <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-description">{product.description}</p>

                            <div className="product-footer">
                                <div className="product-price">
                                    <span className="price-label">Price</span>
                                    <span className="price-amount">{product.price} SOL</span>
                                </div>

                                <button
                                    className="btn-primary btn-buy"
                                    onClick={() => handlePurchase(product)}
                                    disabled={purchasingId === product.id || product.stock === 0}
                                >
                                    {purchasingId === product.id ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            Processing...
                                        </>
                                    ) : product.stock === 0 ? (
                                        'Out of Stock'
                                    ) : (
                                        <>
                                            <span>🛒</span>
                                            Buy Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList;
