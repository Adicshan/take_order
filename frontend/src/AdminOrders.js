import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminOrders.css';

const API_URL = 'http://localhost:5000/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/all`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

  if (loading) {
    return <div className="admin-orders-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders-container">
      <div className="admin-orders-header">
        <div className="header-content">
          <h1>📊 All Orders</h1>
          <p>View and manage all orders in the system</p>
        </div>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>

      {/* Statistics */}
      <div className="orders-stats">
        <div className="stat-card total">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card confirmed">
          <div className="stat-label">Confirmed</div>
          <div className="stat-value">{stats.confirmed}</div>
        </div>
        <div className="stat-card processing">
          <div className="stat-label">Processing</div>
          <div className="stat-value">{stats.processing}</div>
        </div>
        <div className="stat-card shipped">
          <div className="stat-label">Shipped</div>
          <div className="stat-value">{stats.shipped}</div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-label">Delivered</div>
          <div className="stat-value">{stats.delivered}</div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        <input
          type="text"
          placeholder="Search by Order ID, Customer Name, or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="status-filter">
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found matching your criteria.</p>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>Shipping</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} className={`status-${order.status}`}>
                  <td className="order-id">{order.orderId || order._id.substring(0, 8)}</td>
                  <td>{order.buyer?.fullName || 'N/A'}</td>
                  <td>{order.buyer?.email || 'N/A'}</td>
                  <td>
                    <div className="items-cell">
                      {order.items?.map((item, i) => (
                        <div key={i} className="item-info">
                          {item.productName || 'Product'} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>${parseFloat(order.subtotal || 0).toFixed(2)}</td>
                  <td>${parseFloat(order.shipping || 0).toFixed(2)}</td>
                  <td className="total-amount">${parseFloat(order.total || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="date-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="view-btn" title="View Details">👁️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="orders-footer">
        <p>Showing {filteredOrders.length} of {orders.length} orders</p>
      </div>
    </div>
  );
};

export default AdminOrders;
