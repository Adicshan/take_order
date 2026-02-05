import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CartFloating.css';

const CartFloating = () => {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const c = cart.reduce((s, it) => s + (it.cartQuantity || 0), 0);
      setCount(c);
    };

    update();
    window.addEventListener('cartUpdated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('cartUpdated', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  // show floating cart on home, storefront (/:storeSlug) and product/view pages
  const path = location.pathname || '';
  const parts = path.split('/').filter(Boolean); // removes empty
  const isHome = path === '/';
  const isStorefront = parts.length === 1 && parts[0] && parts[0] !== 'products' && parts[0] !== 'marketplace' && parts[0] !== 'admin' && parts[0] !== 'seller-auth' && parts[0] !== 'seller-signin' && parts[0] !== 'seller-signup';
  const isProductView = path.includes('/view/') || path.includes('/product/');

  const show = isHome || isStorefront || isProductView;
  if (!show) return null;

  const storeSlug = parts.length >= 1 && /[a-z-]/i.test(parts[0]) && !parts[0].includes('.') ? parts[0] : '';
  const productId = parts.length >= 3 ? parts[2] : (parts.length >= 2 ? parts[1] : '');

  const goToCart = () => {
    if (storeSlug) navigate(`/${storeSlug}/cart`);
    else if (productId) navigate(`/cart/${productId}`);
    else navigate('/cart');
  };

  return (
    <button className="cart-floating" onClick={goToCart} title="View cart">
      <span className="cart-emoji">🛒</span>
      <span className="cart-badge">{count}</span>
    </button>
  );
};

export default CartFloating;
