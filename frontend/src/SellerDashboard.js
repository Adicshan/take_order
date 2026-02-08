import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SellerDashboard.css';
import { API_URL } from './config';
import Product from './Product';

const SellerDashboard = () => {
  const navigate = useNavigate();
  // Define refs for scrollbars and table at the top of the component
  const ordersTableTopScrollRef = useRef(null);
  const ordersTableBottomScrollRef = useRef(null);
  const ordersTableResponsiveRef = useRef(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);

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
        await Promise.all([
          fetchProducts(),
          fetchOrders(sellerData._id)
        ]);
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
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (sellerId) => {
    try {
      console.log('Fetching orders for seller:', sellerId);
      const response = await fetch(`${API_URL}/orders/seller/${sellerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Orders API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Orders fetched:', data.orders);
        setOrders(data.orders || []);
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('Orders fetch error:', err);
        setMessage({ type: 'error', text: `Failed to load orders: ${err.error || response.statusText}` });
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage({ type: 'error', text: `Error fetching orders: ${error.message}` });
      setOrders([]);
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
        <aside
          className={`dashboard-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
        >
          <div className="sidebar-header">
            <div className="logo-circle">S</div>
            <h2>SellerHub</h2>
          </div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}><span>Overview</span></button>
            <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}><span>Products</span></button>
            <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}><span>Orders</span></button>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}><span>Settings</span></button>
          </nav>
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </aside>
        {/* Sidebar Backdrop (Mobile) */}
        {/* Only show backdrop on mobile when sidebar is open */}
        {sidebarOpen && window.innerWidth <= 600 && (
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}
        {/* Main Content */}
        <div
          className="dashboard-main"
          style={{
            marginLeft:
              window.innerWidth > 1024
                ? 240
                : 0,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--almost-white)',
            transition: 'margin-left 0.3s',
          }}
        >
          <header className="dashboard-header" style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 70, background: '#fff', borderBottom: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
              {/* Hamburger only visible on mobile, left with margin top */}
              <button
                className="hamburger-menu"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title="Toggle menu"
                style={{
                  display: window.innerWidth > 600 ? 'none' : 'flex',
                  alignSelf: 'flex-start',
                  marginTop: 12,
                  marginLeft: 0,
                  marginRight: 16,
                  position: 'relative',
                }}
              >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </button>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Dashboard</h1>
            </div>
            <div className="seller-info" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="seller-name" style={{ fontWeight: 600, fontSize: 16 }}>{seller?.storeName || 'Store'}</span>

            </div>
          </header>
          {message.text && (<div className={`message ${message.type}`}>{message.text}</div>)}
          <div className="dashboard-content" style={{ padding: '40px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            {activeTab === 'overview' && (
              <div>

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
                            <p>₹{Number(product.price).toFixed(2)}</p>
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
          </div>
      
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="products-section">
            {showAddProduct && (
              <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>Add New Product</h2>
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
                        <label>Price (₹) *</label>
                        <aside
                          className={`dashboard-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
                          style={{
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            height: '100vh',
                            zIndex: 100,
                            transition: 'left 0.3s',
                            width: 240,
                            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
                            background: 'linear-gradient(135deg, var(--primary-black) 0%, var(--secondary-black) 100%)',
                            color: 'var(--pure-white)',
                            padding: '30px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                            left: (window.innerWidth <= 1024 ? (sidebarOpen ? 0 : -240) : 0),
                            visibility: window.innerWidth <= 1024 && !sidebarOpen ? 'hidden' : 'visible',
                          }}
                        
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
                        />
                          className="dashboard-main"
                          style={{
                            marginLeft:
                              window.innerWidth > 1024
                                ? 240
                                : 0,
                            minHeight: '100vh',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'var(--almost-white)',
                            transition: 'margin-left 0.3s',
                          }}
                        
                        
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
                      <th>Image</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id} className={`product-row status-${product.status}`}>
                        <td className="product-image-cell">
                          {product.imageUrl || product.image ? (
                            <img
                              src={
                                product.imageUrl && !product.imageUrl.startsWith('http')
                                  ? `${process.env.REACT_APP_API_BASE_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : 'https://take-order.onrender.com')}${product.imageUrl}`
                                  : (product.imageUrl || product.image)
                              }
                              alt={product.name}
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
                              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40x40?text=No+Image'; }}
                            />
                          ) : (
                            <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 18 }}>?</div>
                          )}
                        </td>
                        <td className="product-name-cell">
                          <div className="product-name">
                            
                            <div className="product-details">
                              <span className="product-title">{product.name}</span>
                              <span className="product-id">ID: {product._id.substring(0, 8)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="product-price" style={{backgroundColor:"transparent"}}>
                          <span className="price-value" style={{backgroundColor:"transparent",color:"black",fontSize:"15px"}}>₹{product.price.toFixed(2)}</span>
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
                          <button
                            className="action-link copy"
                            style={{marginLeft:8, fontSize:11, padding:'4px 8px', border:'1px solid #d1d5db', borderRadius:3, background:'#f8f9fb', cursor:'pointer'}}
                            title="Copy product link"
                            onClick={() => {
                              // Prefer storeSlug if available, else fallback to /view/:id
                              const storeSlug = (product.seller && product.seller.storeSlug) || product.storeSlug || '';
                              const url = storeSlug
                                ? `${window.location.origin}/${storeSlug}/view/${product._id}`
                                : `${window.location.origin}/view/${product._id}`;
                              navigator.clipboard.writeText(url);
                            }}
                          >
                            Copy Link
                          </button>
                          <button
                            className="action-link delete"
                            style={{marginLeft:8, fontSize:11, padding:'4px 8px', border:'1px solid #f87171', borderRadius:3, background:'#fef2f2', color:'#b91c1c', cursor:'pointer'}}
                            title="Delete product"
                            onClick={() => {
                              if(window.confirm('Are you sure you want to delete this product?')) {
                                handleDeleteProduct(product._id);
                              }
                            }}
                          >
                            Delete
                          </button>
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
            <div className="orders-stats" style={{display:'flex',gap:'12px',marginBottom:'16px'}}>
              <span style={{
                background: '#f1f3f4',
                color: '#222',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 7,
                padding: '4px 10px',
                letterSpacing: 0.1
              }}>Total: {orders.length}</span>
              <span style={{
                background: '#f1f3f4',
                color: '#222',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 7,
                padding: '4px 10px',
                letterSpacing: 0.1
              }}>Pending: {orders.filter(o => o.status === 'pending').length}</span>
              <span style={{
                background: '#f1f3f4',
                color: '#222',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 7,
                padding: '4px 10px',
                letterSpacing: 0.1
              }}>Confirmed: {orders.filter(o => o.status === 'confirmed').length}</span>
              <span style={{
                background: '#f1f3f4',
                color: '#222',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 7,
                padding: '4px 10px',
                letterSpacing: 0.1
              }}>Revenue: ₹{orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0).toFixed(2)}</span>
            </div>
            <div className="orders-table-scrollbar-top-wrapper">
              <div
                className="orders-table-scrollbar orders-table-scrollbar-top"
                ref={ordersTableTopScrollRef}
                style={{ overflowX: 'auto', overflowY: 'hidden', width: '75vw', minWidth: 600, maxWidth: '100vw', height: 16, margin: '0 auto 2px auto', background: 'transparent', WebkitOverflowScrolling: 'touch' }}
              >
                <div style={{ width: tableScrollWidth, height: 1 }} />
              </div>
              <div
                className="orders-table-responsive"
                ref={ordersTableResponsiveRef}
                style={{ overflowX: 'auto' }}
              >
                <table className="orders-table-modern">
                  <thead>
                    <tr>
                      <th>CONFIRM</th>
                      <th>PRODUCT</th>
                      <th>ORDER DATE</th>
                      <th>ITEMS</th>
                      <th>SUBTOTAL</th>
                      <th>SHIPPING</th>
                      <th>TOTAL</th>
                      <th>BUYER NAME</th>
                      <th>EMAIL</th>
                      <th>PHONE</th>
                      <th>ADDRESS</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                      // Try to get imageUrl from order item, else fallback to product list
                      let imageSrc = '';
                      if (firstItem) {
                        if (firstItem.imageUrl) {
                          imageSrc = firstItem.imageUrl;
                        } else {
                          // Try to find the product in the products list by productId
                          const prod = products.find(p => p._id === (firstItem.productId?._id || firstItem.productId));
                          imageSrc = prod && prod.imageUrl ? prod.imageUrl : '';
                        }
                      }
                      if (!imageSrc) {
                        imageSrc = 'https://via.placeholder.com/40x40?text=No+Image';
                      } else if (!imageSrc.startsWith('http')) {
                        // Always prepend API_BASE_URL for relative paths
                        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : 'https://take-order.onrender.com');
                        imageSrc = `${API_BASE_URL}${imageSrc}`;
                      }
                      return (
                        <tr key={order._id} className={`order-status-${order.status || 'pending'}`}>
                          <td style={{textAlign:'center'}}>
                            <label style={{ display: 'inline-block', position: 'relative', width: 22, height: 22, cursor: 'pointer', margin: 0 }}>
                              <input
                                type="checkbox"
                                checked={order.status === 'confirmed'}
                                onChange={async () => {
                                  const newStatus = order.status === 'confirmed' ? 'pending' : 'confirmed';
                                  try {
                                    const response = await fetch(`${API_URL}/orders/update/${order._id}`, {
                                      method: 'PUT',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                      },
                                      body: JSON.stringify({ status: newStatus })
                                    });
                                    if(response.ok) {
                                      setOrders(prevOrders => prevOrders.map(o => o._id === order._id ? { ...o, status: newStatus } : o));
                                    }
                                  } catch (err) {}
                                }}
                                style={{
                                  opacity: 0,
                                  width: 22,
                                  height: 22,
                                  margin: 0,
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  cursor: 'pointer',
                                }}
                              />
                              <span style={{
                                display: 'inline-block',
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                border: '2px solid #111',
                                background: '#fff',
                                boxSizing: 'border-box',
                                position: 'relative',
                              }}>
                                {order.status === 'confirmed' && (
                                  <span style={{
                                    display: 'block',
                                    width: 15,
                                    height: 15,
                                    borderRadius: '50%',
                                    background: '#39d353',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    border: '2px solid #fff'
                                  }}></span>
                                )}
                              </span>
                            </label>
                          </td>
                          <td className="order-product-img-cell">
                            {firstItem ? (
                              <img src={imageSrc} alt={firstItem.productName || 'Product'} className="order-product-img" width={52} height={52} style={{borderRadius:'8px',objectFit:'cover',background:'#f3f3f3'}} />
                            ) : (
                              <div className="order-product-img-fallback">📦</div>
                            )}
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item, i) => (
                                <span key={i} className="order-item-table">
                                  {item.productName || 'Product'}
                                  <span className="order-qty-badge">x{item.quantity}</span>
                                </span>
                              ))
                            ) : (
                              <span className="no-items">N/A</span>
                            )}
                          </td>
                          <td>₹{parseFloat(order.subtotal || 0).toFixed(2)}</td>
                          <td>₹{parseFloat(order.shipping || 0).toFixed(2)}</td>
                          <td className="order-total"><strong>₹{parseFloat(order.total || 0).toFixed(2)}</strong></td>
                          <td>{order.buyer?.fullName || 'N/A'}</td>
                          <td>{order.buyer?.email || 'N/A'}</td>
                          <td>{order.buyer?.phone || 'N/A'}</td>
                          <td className="order-address-cell order-address-small">
                            {order.buyer ? (
                              <span>{order.buyer.address}, {order.buyer.city}, {order.buyer.state} {order.buyer.zipCode}</span>
                            ) : (
                              <span>N/A</span>
                            )}
                          </td>
                          <td><span className={`status-badge ${order.status || 'pending'}`}>{order.status ? order.status.toUpperCase() : 'PENDING'}</span></td>
                          <td>
                            <button
                              className="order-cancel-btn"
                              style={{background:'#f87171',color:'#fff',border:'none',borderRadius:'6px',padding:'6px 12px',fontWeight:'bold',cursor:'pointer' }}
                              onClick={async () => {
                                if(window.confirm('Are you sure you want to cancel/delete this order?')) {
                                  try {
                                    const response = await fetch(`${API_URL}/orders/${order._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                                    if(response.ok) {
                                      setOrders(prevOrders => prevOrders.filter(o => o._id !== order._id));
                                      setMessage({ type: '', text: '' });
                                    } else {
                                      setMessage({ type: 'error', text: 'Failed to cancel order.' });
                                    }
                                  } catch (err) {
                                    setMessage({ type: 'error', text: 'Error cancelling order.' });
                                  }
                                }
                              }}
                            >Cancel</button>
                          </td>
                        </tr>
                      )})}
                  </tbody>
                </table>
              </div>
              <div
                className="orders-table-scrollbar orders-table-scrollbar-bottom"
                ref={ordersTableBottomScrollRef}
                style={{ overflowX: 'auto', overflowY: 'hidden', width: '75vw', minWidth: 600, maxWidth: '100vw', height: 16, margin: '2px auto 0 auto', background: 'transparent', WebkitOverflowScrolling: 'touch' }}
              >
                <div style={{ width: tableScrollWidth, height: 1 }} />
              </div>
            </div>
          </div>
        )}
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>Store Information</h2>
            <div className="settings-card">
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
            </div>
          </div>
        )}
      </div>
    
    </div>
  )
};

export default SellerDashboard;