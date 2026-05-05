import './Home.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';
import HeroImg from './header_images/heroImg.png';
import BAG from './header_images/bag.png';
import InstantStoreIcon from './header_images/instatStore.png';
import NoCodeIcon from './header_images/noCoding.png';
import SecureIcon from './header_images/Secure.png';
import { useState, useEffect } from 'react';


function Home() {
  const navigate = useNavigate();
  const [clients,setClients] = useState([]);
  const [msg,setMsg] = useState('');

 /* const categories = [
    { name: 'Electronics', count: '2,543 products' },
    { name: 'Fashion', count: '5,891 products' },
    { name: 'Home & Garden', count: '3,214 products' },
    { name: 'Sports & Outdoors', count: '1,876 products' },
    { name: 'Food & Beverages', count: '1,234 products' },
    { name: 'Books & Media', count: '4,156 products' }
  ];
*/


useEffect(() => {
   fetchClientsDetails();
},[]);

const fetchClientsDetails = async () => {
      try{
           const response = await fetch(`https://take-order.onrender.com/api/sellers`);
            if(response.ok){
               const data = await response.json();
               setClients(data.sellers);
               setMsg("Clients details fetched successfully");
            }
            else{
                setMsg("Failed to fetch clients details.");
            }
      }catch(error){
        console.error('Error fetching clients details:', error);
        setMsg("Failed to fetch clients details. Please try again later.");
      }
};




  return (
    <div className="home-container">
     
      {/* Navbar */}
<nav className="navbar">
  <div className="nav-content">

    <div className="logo">Order<span style={{color: '#2e7d32'}}>Place</span>.org</div>

    <div className="search-bar">
      <input type="text" placeholder="Search products, sellers..." />
      <button>Search</button>
    </div>

    <div className="nav-links">
      <button className="seller-login-navbar-btn" onClick={()=> navigate('/seller-signIn')}>Sign In</button>
    </div>

  </div>
</nav>
      {/* Hero Section */}
<section className="hp-hero">

  <div className="hp-hero-left">

    <span className="hp-hero-tag">
      Platform for Online Sellers
    </span>

    <h1 className="hp-hero-title">
      Create your Online Store.<br />
      Upload. Share. <span>Sell.</span>
    </h1>

    <div className="hp-hero-buttons">
      <button className="hp-primary-btn" onClick={()=>window.location.href='/seller-signUp'}>
        Start Your Store →
      </button>
    </div>

    <div className="hp-hero-features">
      <div><img src={InstantStoreIcon} alt='instantStoreIcon' /> No Coding</div>
      <div><img src={NoCodeIcon} alt='noCodeIcon' /> No Coding</div>
      <div><img src={SecureIcon} alt='secureIcon' /> Secure & Reliable</div>
    </div>

  </div>

  <div className="hp-hero-right">
    <img src={HeroImg} alt="Store Preview" />
  </div>

</section>

<section className="clients-section">

  <h2 className='clients-title'>Our <span>Clients</span></h2>
 <p className="clients-sub">Trusted by amazing sellers across India.</p>
  <div className="clients-grid">

      {clients && clients.length > 0 ? (
        clients.map((client) => (
          <div className='client-card' key={client._id}>
            <div className="client-header">
              <img src={BAG} alt="bag" />
              <h4>{client.storeName}</h4>
            </div>

         <img src={client.storeImg} alt={client.storeName} className='client-preview' />
         <button className="client-url" onClick={()=>window.location.href=`http://localhost:3000/${client.storeSlug}/`}>
           {client.storeSlug}
         </button>
     </div>
        ))
      ) : (
        <p>No clients found.</p>
     )}



  </div>
</section>


      {/* How It Works */}
<section className="how-it-works">

  <h2>How It Works</h2>
  <p>Start your online business in 3 simple steps.</p>

  <div className="steps">

    <div className="step">
      <div className="step-number">1</div>
      <h3>Upload Product Details</h3>
      <p>Add your products with image, price, description.</p>
    </div>

    <div className="step">
      <div className="step-number">2</div>
      <h3>Get Your Store Link</h3>
      <p>Your unique online store URL is generated instantly.</p>
    </div>

    <div className="step">
      <div className="step-number">3</div>
      <h3>Start Selling</h3>
      <p>Share your link and start receiving orders.</p>
    </div>

  </div>

</section>
      {/* For Sellers */}
      <section className="for-sellers">
        <div className="sellers-content">
          <h2>Start Selling on OrderPlace</h2>
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


      {/* Footer */}
<footer className="footer">

  <div className="footer-content">

    {/* BRAND */}
    <div className="footer-section">
      <h3 className="footer-logo">OrderPlace</h3>
      <p className="footer-desc">
        Build your online store in minutes. Upload products, get your store link, and start selling instantly.
      </p>
    </div>

    {/* CONTACT */}
    <div className="footer-section">
      <h4>Contact</h4>
      <ul>
        <li>Email: adityakr8816616@gmail.com</li>
        <li>Phone: +91 96080 45844</li>
        <li>India</li>
      </ul>
    </div>

    {/* QUICK LINKS */}

    {/* SOCIAL */}
    <div className="footer-section">
      <h4>Follow Us</h4>
      <ul>
        <li>
          <a href="https://instagram.com/orderplace_org" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </li>
      </ul>
    </div>

  </div>

  <div className="footer-bottom">
    <p>© 2026 OrderPlace. All rights reserved.</p>
  </div>

</footer>
    </div>
  );
}

export default Home;
