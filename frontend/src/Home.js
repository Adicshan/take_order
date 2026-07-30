import './Home.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';
import { WEB_URL} from './config';
import HeroImg from './header_images/Product-page.png';
import InstantStoreIcon from './header_images/instatStore.png';
import NoCodeIcon from './header_images/noCoding.png';
import SecureIcon from './header_images/Secure.png';
import { useState, useEffect } from 'react';
import HIW from "./header_images/Hiw.png";
import slugify from 'slugify';
import {
  FiUpload,
  FiTag,
  FiFileText,
  FiDollarSign,
  FiUser,
  FiLink2,
  FiCopy,
  FiSmartphone
} from "react-icons/fi";


function Home() {
  const navigate = useNavigate();
  const [clients,setClients] = useState([]);
  const [msg,setMsg] = useState('');

  const [link,setLink]=useState('');
  const [image,setImage] = useState(null);
    const [productData, setProductData] = useState({
      name: '',
      description: '',
      price: '',
      quantity: 1,
      category: 'Other',
      size: 'No',
      imageFile: null,
      imagePreview: null
    });
  const [sellerData, setSellerData] = useState({
      // Step 1 - Personal Info
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      // Step 2 - Business Info
      storeName: '',
      businessType: 'individual',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      // Step 3 - Verification
      taxId: '',
      bankAccount: '',
      idDocument: null
    });

    const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(e.target.files[0]));
      setProductData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };



    const handleSellerInputChange = (e) => {
    const { name, value } = e.target;
    setSellerData(prev => ({ ...prev, [name]: value }));
    
  };

      const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
    
  };

const handleGenerateLink = async () => {
    //  e.preventDefault();
    
        console.log("Inside Add Seller");
        console.log("STORENAME:", sellerData.storeName);
        let sellerId = '';
        let storeSlug = '';
        let productId = '';
        try {
          const payload = {
            fullName: sellerData.storeName,
            email: sellerData.storeName,
            password: "12345678",
            phone: sellerData.phone,
            storeName: sellerData.storeName,
            storeSlug: slugify(sellerData.storeName || '', { lower: true, strict: true }),
            businessType: 'small_business',
            address: {
              street: sellerData.storeName,
              city:sellerData.storeName,
              state: sellerData.storeName,
              zipCode: sellerData.storeName,
              country: sellerData.storeName
            },
            taxId: sellerData.storeName,
            bankAccount: sellerData.storeName
          };

          console.log("Payload:", payload);
    
          const response = await fetch(`${API_URL}/seller-auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
    
          const data = await response.json();
          console.log(data.seller._id);
          console.log("StoreSlug:",data.seller.storeSlug);
          sellerId = data.seller._id;
          storeSlug= data.seller.storeSlug;
    
          if (response.ok) {
            localStorage.setItem('sellerToken', data.token);
            console.log("Seller has added.");
          } else {
            console.log("Seller has not added.");
          }
        } catch (err) {
          console.error(err);
        }

        // product data save 


            try {
              const formData = new FormData();
              formData.append('name', productData.name);
              formData.append('description', productData.description);
              formData.append('price', productData.price);
              formData.append('quantity', productData.quantity);
              formData.append('category', productData.category);
              formData.append('size', productData.size);
              if (productData.imageFile) {
                formData.append('image', productData.imageFile);
              }
              // Attach seller ID to product creation
              if (sellerId) {
                console.log("Seller id:",sellerId);
                formData.append('sellerId', sellerId);
              }
              const response = await fetch(`${API_URL}/products/createProduct`, {
                method: 'POST',
                body: formData
              });
              const data = await response.json();
              console.log("Product ID:",data.productId);
              productId = data.productId;
              if (response.ok) {
                console.log("Product added successfully.");


              } else {
                console.log("fail to add product");
              }
            } catch (error) {
              console.error('Error adding product:', error);

            }



            setLink(`${WEB_URL}/${storeSlug}/view/${productId}`);
  }






  return (
    <div className="home-container">
     
      {/* Navbar */}
<nav className="navbar">
  <div className="nav-content">

    <div className="logo">Order<span style={{color: '#2e7d32'}}>Place</span>.org</div>
{/*}
    <div className="search-bar">
      <input type="text" placeholder="Search products, sellers..." />
      <button>Search</button>
    </div>
*/}
    <div className="nav-links">
      <button className="seller-login-navbar-btn" onClick={()=> navigate('/seller-signIn')}>Sign In</button>
    </div>

  </div>
</nav>
      {/* Hero Section */}
<section className="hp-hero">

  <div className="hp-hero-left">
{/*}
    <span className="hp-hero-tag">
      Perfect for Instagram & WhatsApp Sellers
    </span>
*/}
    <h1 className="hp-hero-title">
      Get Your Product Link<br />
      in <span>30 Seconds</span>
    </h1>



<div className="product-form">

  {/* Upload Card */}

  <label className="upload-box">

   {/*} {image ? (*/}
      <div className="preview-wrapper">

        {image ? (
    <img
      src={image}
      alt="Product"
      className="preview-image"
    />
  ) : (
    <div className="preview-placeholder">
      <FiUpload className="preview-upload-icon" />
    </div>
  )}

        <div className="preview-info">
          <p>Upload Product Image</p>
          
        </div>

      </div>
  

    <input
      type="file"
      name="image"
      accept="image/*"
      onChange={handleImage}
    />

  </label>

  {/* Form */}

 {/*} {image && */}

    <div className="form-fields">

      <div className="input-group">
        <FiTag className="input-icon" />

        <input
          type="text"
          name="name"
          value={productData.name}
          onChange={handleProductInputChange}
          placeholder="Product Name"
        />
      </div>

      <div className="input-group textarea-group">
        <FiFileText className="input-icon" />

        <textarea
          rows={4}
          name="description"
          value={productData.description}
          onChange={handleProductInputChange}
          placeholder="Product Description"
        />
      </div>

      <div className="double-input">

        <div className="input-group">
          <FiDollarSign className="input-icon" />

          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleProductInputChange}
            placeholder="Price"
          />
        </div>

        <div className="input-group">
          <FiUser className="input-icon" />

          <input
            type="text"
            name="storeName"
            value={sellerData.storeName}
            onChange={handleSellerInputChange}
            placeholder="Seller Name"
          />
        </div>


        <div className="input-group">
  <FiSmartphone className="input-icon" />

  <input
    type="tel"
    name="phone"
    value={sellerData.phone}
    onChange={handleSellerInputChange}
    placeholder="UPI / PhonePe / GPay / Paytm Number"
  />
</div>

      </div>

      <button
        className="generate-btn"
        onClick={handleGenerateLink}
      >
        <FiLink2 />

        <span>Generate Product Link</span>

      </button>

      {link && (

        <div className="generated-link">

          <input
            type="text"
            value={link}
            readOnly
          />

          <button
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(link)}
          >
            <FiCopy />
          </button>

        </div>

      )}

    </div>

  {/*})}*/}

</div>


    <div className="hp-hero-features">
      <div><img src={InstantStoreIcon} alt='instantStoreIcon' /> Instant Store</div>
      <div><img src={NoCodeIcon} alt='noCodeIcon' /> No Coding</div>
      <div><img src={SecureIcon} alt='secureIcon' /> Secure & Reliable</div>
    </div>

  </div>

  <div className="hp-hero-right">
    <img src={HeroImg} alt="Store Preview" />
    <img src={HIW} alt="How It Works" className="hiw-image" />
  </div>

</section>

{/*}
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
         <button className="client-url" onClick={()=>window.location.href=`https://orderplace.org/${client.storeSlug}/`}>
           {client.storeSlug}
         </button>
     </div>
        ))
      ) : (
        <p>No clients found.</p>
     )}



  </div>
</section>
*/}

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
      <h3>Add Payment Details</h3>
      <p>Enter your UPI ID, Phone number to receive payments.</p>
    </div>

    <div className="step">
      <div className="step-number">3</div>
      <h3>Get Your Product Link</h3>
      <p>Get your product link instantly and start selling.</p>
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
