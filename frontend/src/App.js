import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './Home';
import SellerAuth from './SellerAuth';
import SellerSignIn from './SellerSignIn';
import SellerSignUp from './SellerSignUp';
import SellerDashboard from './SellerDashboard';
import AllProducts from './AllProducts';
import CustomerMarketplace from './CustomerMarketplace';
import SellerStorefront from './SellerStorefront';
import Product from './Product';
import ProductDetail from './ProductDetail';
import CustomerCart from './CustomerCart';
import Order from './Order';
import OrderConfirmation from './OrderConfirmation';
import AdminOrders from './AdminOrders';
import CartFloating from './CartFloating';

function App() {
  return (
    <Router>
      <CartFloating />
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Seller Routes */}
        <Route path="/seller-auth" element={<SellerAuth />} />
        <Route path="/seller-signin" element={<SellerSignIn />} />
        <Route path="/seller-signup" element={<SellerSignUp />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        
        {/* Customer Routes */}
        <Route path="/products" element={<AllProducts />} />
        <Route path="/marketplace" element={<CustomerMarketplace />} />
        <Route path="/shop/:sellerId" element={<SellerStorefront />} />
        <Route path="/Product/:sellerId" element={<SellerStorefront />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/view/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<CustomerCart />} />
        <Route path="/cart/:sellerId" element={<CustomerCart />} />
        <Route path="/order/:sellerId" element={<Order />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
