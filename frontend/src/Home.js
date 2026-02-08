import './Home.css';
import { Link } from 'react-router-dom';

function Home() {

  const categories = [
    { name: 'Electronics', count: '2,543 products' },
    { name: 'Fashion', count: '5,891 products' },
    { name: 'Home & Garden', count: '3,214 products' },
    { name: 'Sports & Outdoors', count: '1,876 products' },
    { name: 'Food & Beverages', count: '1,234 products' },
    { name: 'Books & Media', count: '4,156 products' }
  ];

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">MarketPlace</div>
          <div className="search-bar">
            <input type="text" placeholder="Search products, sellers..." />
            <button>Search</button>
          </div>
          <div className="nav-links">
            <button className="seller-login-navbar-btn" onClick={() => window.location.href='/seller-signin'}>Seller Login</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Quality Products from Trusted Sellers</h1>
          <p>Shop from thousands of verified sellers. Buy with confidence, sell with ease.</p>
          <div className="hero-buttons">
            <Link to="/products" style={{fontSize:"12px"}} className="btn btn-primary hero-btn">Shop Now</Link>
            <Link to="/seller-signin" style={{fontSize:"12px",color:"black"}} className="btn hero-btn btn-outline">Become a Seller</Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <div key={idx} className="category-card">
              <h3>{cat.name}</h3>
             
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Browse Products</h3>
            <p>Explore thousands of products from verified sellers across all categories.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Place Order</h3>
            <p>Add items to cart and checkout securely. Multiple payment options available.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Fast Delivery</h3>
            <p>Sellers ship your order quickly. Track your package in real-time.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Rate & Review</h3>
            <p>Share your experience with products and sellers. Help the community.</p>
          </div>
        </div>
      </section>

      {/* For Sellers */}
      <section className="for-sellers">
        <div className="sellers-content">
          <h2>Start Selling on MarketPlace</h2>
          <p>Join thousands of successful sellers. Reach millions of customers worldwide.</p>
          <div className="seller-benefits">
            <div className="benefit" style={{color:'black'}}>
              <h4>Easy Setup</h4>
              <p style={{color:"black"}}>Create your store in minutes with no technical knowledge required.</p>
            </div>
            <div className="benefit">
              <h4>Low Fees</h4>
              <p style={{color:"black"}}>Keep more of your profits with our competitive commission rates.</p>
            </div>
            <div className="benefit">
              <h4>Analytics</h4>
              <p style={{color:"black"}}>Track sales, inventory, and customer feedback in real-time.</p>
            </div>
            <div className="benefit">
              <h4>Support</h4>
              <p style={{color:"black"}}>24/7 customer support team ready to help your business grow.</p>
            </div>
          </div>
          <Link to="/seller-signup" className="btn btn-primary btn-large">Become a Seller</Link>
        </div>
      </section>


      {/* Trust Section */}
      <section className="trust">
        <h2>Why Shop with Us</h2>
        <div className="trust-items">
            <div className="trust-item">
            <h4>Verified Sellers</h4>
            <p>All sellers are verified and authenticated to ensure quality products.</p>
          </div>
          <div className="trust-item">
            <h4>Secure Payments</h4>
            <p>Your transactions are protected with industry-leading encryption.</p>
          </div>
          <div className="trust-item">
            <h4>Buyer Protection</h4>
            <p>Every purchase is covered by our buyer protection guarantee.</p>
          </div>
          <div className="trust-item">
            <h4>Easy Returns</h4>
            <p>Hassle-free returns within 30 days if you're not satisfied.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <h2>Start Shopping Today</h2>
        <p>Discover amazing products from sellers you can trust</p>
        <Link to="/products" className="btn btn-primary btn-large">Browse Products</Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#press">Press</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>For Buyers</h4>
            <ul>
              <li><a href="#browse">Browse Products</a></li>
              <li><a href="#orders">Track Orders</a></li>
              <li><a href="#returns">Returns</a></li>
              <li><a href="#help">Help Center</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>For Sellers</h4>
            <ul>
              <li><a href="#sell">Start Selling</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#seller-hub">Seller Hub</a></li>
              <li><a href="#tools">Tools & Resources</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 MarketPlace. All rights reserved. | Connecting buyers and sellers worldwide</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
