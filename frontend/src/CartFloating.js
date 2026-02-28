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

  // show floating cart on storefront (/:storeSlug) and product/view pages
  const path = location.pathname || '';
  const parts = path.split('/').filter(Boolean); // removes empty
  // Exclude known top-level routes so they are not mistaken for a storeSlug
  const excludedTopLevel = ['products','marketplace','admin','seller-auth','seller-signin','seller-signup','seller-dashboard','cart','order','product','view','public'];
  const isStorefront = parts.length === 1 && parts[0] && !excludedTopLevel.includes(parts[0]);
  const isProductView = path.includes('/view/') || path.includes('/product/');
  const isOrderConfirmation = path.includes('/order-confirmation');

  const show = (isStorefront || isProductView) && !isOrderConfirmation;
  if (!show) return null;

  // Extract storeSlug from first part of URL if it's not an excluded route
  const storeSlug = (parts.length >= 1 && /[a-z-]/i.test(parts[0]) && !parts[0].includes('.') && !excludedTopLevel.includes(parts[0])) ? parts[0] : '';

  const goToCart = () => {
    if (storeSlug) navigate(`/${storeSlug}/cart`);
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
