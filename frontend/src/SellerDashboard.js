import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SellerDashboard.css';
import { API_URL } from './config';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    imageFile: null,
    imagePreview: null
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = localStorage.getItem('sellerToken');

  useEffect(() => {
    if (!token) {
      navigate('/seller-signin');
      return;
    }
    fetchSellerData();
  }, [token, navigate]);

  const fetchSellerData = async () => {
    try {
      const response = await fetch(`${API_URL}/seller-auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // server returns { success: true, seller }
        const sellerData = data.seller || data;
        setSeller(sellerData);
        // Fetch products and orders after getting seller data
        fetchProducts();
        fetchOrders(sellerData._id);
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
      setMessage({ type: 'error', text: 'Failed to load seller data' });
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products/seller-products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchOrders = async (sellerId) => {
    try {
      const response = await fetch(`${API_URL}/orders/seller/${sellerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sellerToken');
    navigate('/seller-signin');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!productFormData.name || !productFormData.description || !productFormData.price || !productFormData.quantity || !productFormData.category) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', productFormData.name);
      formData.append('description', productFormData.description);
      formData.append('price', productFormData.price);
      formData.append('quantity', productFormData.quantity);
      formData.append('category', productFormData.category);
      if (productFormData.imageFile) {
        formData.append('image', productFormData.imageFile);
      }

      const response = await fetch(`${API_URL}/products/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setProducts([data.product, ...products]);
        setProductFormData({ name: '', description: '', price: '', quantity: '', category: '', imageFile: null, imagePreview: null });
        setShowAddProduct(false);
        setMessage({ type: 'success', text: 'Product added successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add product' });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage({ type: 'error', text: 'Error adding product: ' + error.message });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_URL}/products/delete/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productId));
        setMessage({ type: 'success', text: 'Product deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage({ type: 'error', text: 'Error deleting product' });
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.soldCount), 0);
  const totalSold = products.reduce((sum, p) => sum + p.soldCount, 0);
  const activeProducts = products.filter(p => p.status === 'active').length;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-circle">S</div>
          <h2>SellerHub</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('overview');
              setSidebarOpen(false);
            }}
          >
            <span>Overview</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('products');
              setSidebarOpen(false);
            }}
          >
            <span>Products</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('orders');
              setSidebarOpen(false);
            }}
          >
            <span>Orders</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              setSidebarOpen(false);
            }}
          >
            <span>Settings</span>
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </aside>

      {/* Sidebar Backdrop (Mobile) */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button 
            className="hamburger-menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <h1>Dashboard</h1>
          <div className="seller-info">
            <span className="seller-name">{seller?.storeName || 'Store'}</span>
            <span className="seller-status">Verified Seller</span>
          </div>
        </header>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="dashboard-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value">${totalRevenue.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Sold</div>
                  <div className="stat-value">{totalSold}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active Products</div>
                  <div className="stat-value">{activeProducts}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Products</div>
                  <div className="stat-value">{products.length}</div>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="empty-state">
                  <p>No products yet. Add your first product to get started!</p>
                </div>
              ) : (
                <div className="recent-section">
                  <h3>Your Products</h3>
                  <div className="products-list-simple">
                    {products.slice(0, 5).map(product => (
                      <div key={product._id} className="product-item">
                        <div className="product-info-simple">
                          <h4>{product.name}</h4>
                          <p>${product.price}</p>
                        </div>
                        <div className="product-meta">
                          <span className="qty">Stock: {product.quantity}</span>
                          <span className={`status ${product.status}`}>{product.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="products-section">
              <div className="section-header">
                <h2>Products</h2>
                <button className="btn-primary" onClick={() => setShowAddProduct(true)}>+ Add Product</button>
              </div>

              {showAddProduct && (
                <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Add Product</h3>
                      <button className="close-btn" onClick={() => setShowAddProduct(false)}>×</button>
                    </div>
                    <form onSubmit={handleAddProduct}>
                      <div className="form-group">
                        <label>Product Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={productFormData.name}
                          onChange={handleInputChange}
                          placeholder="Product name"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Description *</label>
                        <textarea
                          name="description"
                          value={productFormData.description}
                          onChange={handleInputChange}
                          placeholder="Product description"
                          rows="3"
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Price ($) *</label>
                          <input
                            type="number"
                            name="price"
                            value={productFormData.price}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Quantity *</label>
                          <input
                            type="number"
                            name="quantity"
                            value={productFormData.quantity}
                            onChange={handleInputChange}
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Category *</label>
                        <select name="category" value={productFormData.category} onChange={handleInputChange} required>
                          <option value="">Select Category</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Home">Home & Garden</option>
                          <option value="Sports">Sports & Outdoors</option>
                          <option value="Food">Food & Beverages</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Product Image</label>
                        <input
                          type="file"
                          name="image"
                          onChange={handleImageChange}
                          accept="image/*"
                          placeholder="Choose product image"
                        />
                        {productFormData.imagePreview && (
                          <div className="image-preview">
                            <img src={productFormData.imagePreview} alt="Product Preview" style={{ maxWidth: '150px', maxHeight: '150px', marginTop: '10px' }} />
                          </div>
                        )}
                      </div>

                      <div className="modal-buttons">
                        <button type="submit" className="btn-primary">Add Product</button>
                        <button type="button" className="btn-secondary" onClick={() => setShowAddProduct(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {products.length === 0 ? (
                <div className="empty-state">
                  <p>No products added yet. Click "+ Add Product" to create your first product.</p>
                </div>
              ) : (
                <div className="products-table-wrapper">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th className="actions-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id} className={`product-row status-${product.status}`}>
                          <td className="product-name-cell">
                            <div className="product-name">
                              <span className="product-icon">📦</span>
                              <div className="product-details">
                                <span className="product-title">{product.name}</span>
                                <span className="product-id">ID: {product._id.substring(0, 8)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="product-price" style={{backgroundColor:"transparent"}}>
                            <span className="price-value" style={{backgroundColor:"transparent",color:"black",fontSize:"15px"}}>{product.price.toFixed(2)}</span>
                          </td>
                          <td className="product-stock">
                            <span className={`stock-badge ${product.quantity > 10 ? 'in-stock' : product.quantity > 0 ? 'low-stock' : 'out-of-stock'}`}>
                              {product.quantity} units
                            </span>
                          </td>
                          <td className="product-category">
                            <span className="category-tag">{product.category}</span>
                          </td>
                          <td className="product-status">
                            <span className={`status-badge ${product.status}`}>
                              {product.status === 'active' ? '✓ Active' : '○ Inactive'}
                            </span>
                          </td>
                          <td className="product-actions">
                            <div className="action-buttons">
                              <a 
                                href={`/${seller?.storeSlug}/view/${product._id}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="action-link view"
                                title="View product"
                              >
                                View
                              </a>
                              <button 
                                className="action-link copy"
                                onClick={() => {
                                  const url = `${window.location.origin}/${seller?.storeSlug}/view/${product._id}`;
                                  navigator.clipboard.writeText(url);
                                  setMessage({ type: 'success', text: 'Product URL copied!' });
                                  setTimeout(() => setMessage({ type: '', text: '' }), 2500);
                                }}
                                title="Copy product URL"
                              >
                                Copy
                              </button>
                              <button 
                                className="action-link delete"
                                onClick={() => handleDeleteProduct(product._id)}
                                title="Delete product"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-section">
              <div className="section-header">
                <h2>Orders</h2>
                {orders.length > 0 && (
                  <div className="orders-stats-mini">
                    <span className="stat">Total: {orders.length}</span>
                    <span className="stat">Pending: {orders.filter(o => o.status === 'pending').length}</span>
                    <span className="stat">Confirmed: {orders.filter(o => o.status === 'confirmed').length}</span>
                    <span className="stat">Revenue: ${orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <p>📦 No orders yet. Your orders will appear here.</p>
                </div>
              ) : (
                <div className="orders-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Order Date</th>
                        <th>Items</th>
                        <th>Subtotal</th>
                        <th>Shipping</th>
                        <th>Total</th>
                        <th>Buyer Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id} className={`order-status-${order.status || 'pending'}`}>
                          <td className="order-id"><strong>{order.orderId || order._id.substring(0, 8)}</strong></td>
                          <td className="order-date">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="order-items-cell">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, i) => (
                                  <div key={i} className="order-item">
                                    <span className="item-name">{item.productName || 'Product'}</span>
                                    <span className="item-qty">x{item.quantity}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="no-items">N/A</span>
                              )}
                            </div>
                          </td>
                          <td>${parseFloat(order.subtotal || 0).toFixed(2)}</td>
                          <td>${parseFloat(order.shipping || 0).toFixed(2)}</td>
                          <td className="order-total"><strong>${parseFloat(order.total || 0).toFixed(2)}</strong></td>
                          <td>{order.buyer?.fullName || 'N/A'}</td>
                          <td className="order-email">{order.buyer?.email || 'N/A'}</td>
                          <td>{order.buyer?.phone || 'N/A'}</td>
                          <td className="order-address">
                            {order.buyer ? (
                              <div className="address-block">
                                <span>{order.buyer.address}</span>
                                <span>{order.buyer.city}, {order.buyer.state} {order.buyer.zipCode}</span>
                              </div>
                            ) : (
                              <span>N/A</span>
                            )}
                          </td>
                          <td>
                            <div>
                              <span className={`status-badge ${order.status || 'pending'}`}>
                                {order.status || 'pending'}
                              </span>
                              {order.status === 'dispatched' && (
                                <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--parrot-green)', color: 'var(--pure-white)', borderRadius: '2px', fontSize: '11px', fontWeight: '600', textAlign: 'center' }}>
                                  ✓ Done
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Store Information</h2>
              <div className="settings-card">
                <h4>📦 Store Details</h4>
                <div className="settings-info-grid">
                  <div className="settings-info-item">
                    <span className="settings-info-label">Store Name</span>
                    <span className="settings-info-value">{seller?.storeName}</span>
                  </div>
                  <div className="settings-info-item">
                    <span className="settings-info-label">Email</span>
                    <span className="settings-info-value">{seller?.email}</span>
                  </div>
                  <div className="settings-info-item">
                    <span className="settings-info-label">Phone</span>
                    <span className="settings-info-value">{seller?.phone}</span>
                  </div>
                  <div className="settings-info-item">
                    <span className="settings-info-label">Business Type</span>
                    <span className="settings-info-value">{seller?.businessType}</span>
                  </div>
                  <div className="settings-info-item">
                    <span className="settings-info-label">Verification Status</span>
                    <span className={`status-badge ${seller?.isVerified ? 'verified' : 'pending'}`}>
                      {seller?.isVerified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                
                <div className="public-url">
                  <h5>🌐 Public Store URL</h5>
                  <div className="url-row">
                    <a href={`${window.location.origin}/${seller?.storeSlug}`} target="_blank" rel="noreferrer">
                      {`${window.location.origin}/${seller?.storeSlug}`}
                    </a>
                    <button
                      className="copy-btn"
                      onClick={() => {
                        const url = `${window.location.origin}/${seller?.storeSlug}`;
                        try {
                          navigator.clipboard.writeText(url);
                          setMessage({ type: 'success', text: 'Store URL copied to clipboard' });
                          setTimeout(() => setMessage({ type: '', text: '' }), 2500);
                        } catch (err) {
                          console.error('Clipboard write failed', err);
                          setMessage({ type: 'error', text: 'Unable to copy URL' });
                          setTimeout(() => setMessage({ type: '', text: '' }), 2500);
                        }
                      }}
                    >Copy Link</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
