import './Home.css';
import { Link } from 'react-router-dom';

function Home() {
  const featuredProducts = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      seller: 'TechGear Store',
      price: '$89.99',
      originalPrice: '$129.99',
      rating: '4.8',
      reviews: 342,
      image: '🎧'
    },
    {
      id: 2,
      name: 'Organic Coffee Beans - 1kg',
      seller: 'Mountain Coffee Co.',
      price: '$24.99',
      originalPrice: '$34.99',
      rating: '4.9',
      reviews: 156,
      image: '☕'
    },
    {
      id: 3,
      name: 'Stainless Steel Water Bottle',
      seller: 'EcoLiving Brand',
      price: '$32.50',
      originalPrice: '$45.00',
      rating: '4.7',
      reviews: 289,
      image: '🧴'
    },
    {
      id: 4,
      name: 'Professional Camera Tripod',
      seller: 'ProPhoto Equipment',
      price: '$45.99',
      originalPrice: '$65.00',
      rating: '4.6',
      reviews: 198,
      image: '📷'
    }
  ];

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
            <Link to="/">Home</Link>
            <Link to="/products">Browse Products</Link>
            <Link to="/marketplace">Sellers</Link>
            <Link to="/seller-signin" className="seller-link">Sell</Link>
            <Link to="/cart" className="cart-link">🛒 Cart</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Quality Products from Trusted Sellers</h1>
          <p>Shop from thousands of verified sellers. Buy with confidence, sell with ease.</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">🛍️ Shop Now</Link>
            <Link to="/seller-signin" className="btn btn-secondary">📦 Become a Seller</Link>
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
              <p>{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/products" className="view-all">View All →</Link>
        </div>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">{product.image}</div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="seller-name">{product.seller}</p>
                <div className="rating">
                  <span className="stars">★★★★★</span>
                  <span className="rating-score">{product.rating}</span>
                  <span className="reviews">({product.reviews})</span>
                </div>
                <div className="price">
                  <span className="current">{product.price}</span>
                  <span className="original">{product.originalPrice}</span>
                </div>
                <button className="btn btn-sm">Add to Cart</button>
              </div>
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
            <div className="benefit">
              <h4>✓ Easy Setup</h4>
              <p>Create your store in minutes with no technical knowledge required.</p>
            </div>
            <div className="benefit">
              <h4>✓ Low Fees</h4>
              <p>Keep more of your profits with our competitive commission rates.</p>
            </div>
            <div className="benefit">
              <h4>✓ Analytics</h4>
              <p>Track sales, inventory, and customer feedback in real-time.</p>
            </div>
            <div className="benefit">
              <h4>✓ Support</h4>
              <p>24/7 customer support team ready to help your business grow.</p>
            </div>
          </div>
          <Link to="/seller-signup" className="btn btn-primary btn-large">Become a Seller</Link>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stat">
          <h3>50K+</h3>
          <p>Active Sellers</p>
        </div>
        <div className="stat">
          <h3>500K+</h3>
          <p>Products Listed</p>
        </div>
        <div className="stat">
          <h3>2M+</h3>
          <p>Happy Customers</p>
        </div>
        <div className="stat">
          <h3>99.2%</h3>
          <p>Satisfaction Rate</p>
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
