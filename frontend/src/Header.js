import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((s, it) => s + (it.cartQuantity || 0), 0);
      setCartCount(count);
    };

    update();

    window.addEventListener('cartUpdated', update);
    window.addEventListener('storage', update);

    return () => {
      window.removeEventListener('cartUpdated', update);
      window.removeEventListener('storage', update);
    };
  }, [location]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">BlackCart</Link>

        <div className="header-actions">
          <Link to="/cart" className="cart-link">🛒 <span className="cart-count">{cartCount}</span></Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
