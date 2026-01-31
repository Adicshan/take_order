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

  // show floating cart only on product-related pages
  const path = location.pathname || '';
  const show = path.startsWith('/product/') || path.startsWith('/Product/');
  if (!show) return null;

  // prefer product id from path for cart URL (path: /product/:id or /Product/:id)
  const parts = path.split('/').filter(Boolean); // removes empty
  const productId = parts.length >= 2 ? parts[1] : (parts[0] || '');

  const goToCart = () => {
    if (productId) navigate(`/cart/${productId}`);
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
