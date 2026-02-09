import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './Home';
import SellerAuth from './SellerAuth';
import SellerSignIn from './SellerSignIn';
import SellerSignUp from './SellerSignUp';
import SellerResetPassword from './SellerResetPassword';
import SellerSetNewPassword from './SellerSetNewPassword';
import SellerDashboard from './SellerDashboard';
import AllProducts from './AllProducts';
import CustomerMarketplace from './CustomerMarketplace';
import SellerStorefront from './SellerStorefront';
import ProductDetail from './ProductDetail';
import CustomerCart from './CustomerCart';
import Order from './Order';
import OrderConfirmation from './OrderConfirmation';
import AdminOrders from './AdminOrders';
import CartFloating from './CartFloating';
import ProductToStore from './Redirects/ProductToStore';
import SellerToStore from './Redirects/SellerToStore';


function App() {
  return (
    <Router>
      {/* Show CartFloating only on allowed pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Seller Routes */}
        <Route path="/seller-auth" element={<SellerAuth />} />
        <Route path="/seller-signin" element={<SellerSignIn />} />
        <Route path="/seller-signup" element={<SellerSignUp />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/seller-reset-password" element={<SellerResetPassword />} />
        <Route path="/seller-set-password" element={<SellerSetNewPassword />} />
        
        {/* Customer Routes */}
        <Route path="/products" element={<AllProducts />} />
      </Routes>
      {/* CartFloating only on non-auth pages */}
      {(() => {
        const path = window.location.pathname;
        // Hide on seller password reset page
        if (path === '/seller-reset-password') return null;
        return <CartFloating />;
      })()}
      <Routes>
        <Route path="/marketplace" element={<CustomerMarketplace />} />
        
        {/* Shop routes - by storeSlug (main route) */}
        <Route path="/:storeSlug" element={<SellerStorefront />} />
        <Route path="/:storeSlug/product/:productId" element={<ProductDetail />} />
        {/* Alias: allow /:storeSlug/view/:productId so URLs like /adicshan/view/:id work */}
        <Route path="/:storeSlug/view/:productId" element={<ProductDetail />} />
        <Route path="/:storeSlug/cart" element={<CustomerCart />} />
        <Route path="/:storeSlug/order" element={<Order />} />
        
        {/* Fallback routes for legacy/direct product access - redirect to slug-based routes */}
        <Route path="/product/:productId" element={<ProductToStore />} />
        <Route path="/view/:productId" element={<ProductToStore />} />
        <Route path="/cart" element={<CustomerCart />} />
        <Route path="/cart/:sellerId" element={<SellerToStore target={'cart'} />} />
        <Route path="/order/:sellerId" element={<SellerToStore target={'order'} />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
