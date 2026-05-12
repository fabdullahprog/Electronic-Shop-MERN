import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer-main">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">Electronic Shop</Link>
            <p>Your ultimate online shopping destination. Quality products, great prices, and fast delivery across Bangladesh.</p>
            <div className="social-links">
              <a href="#!" aria-label="Facebook"><FiFacebook /></a>
              <a href="#!" aria-label="Instagram"><FiInstagram /></a>
              <a href="#!" aria-label="Twitter"><FiTwitter /></a>
              <a href="#!" aria-label="YouTube"><FiYoutube /></a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?sort=newest">New Arrivals</Link></li>
              <li><Link to="/products?featured=true">Featured Items</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/orders">Track Order</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><a href="#!">Return Policy</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <div className="contact-item"><FiMapPin /> 123 Commerce Street, Dhaka, Bangladesh</div>
            <div className="contact-item"><FiPhone /> +880 1700-000000</div>
            <div className="contact-item"><FiMail /> Electronic Shop@gmail.com.bd</div>
            <div className="payment-methods">
              <h5>Payment Methods</h5>
              <div className="payment-icons">
                {['COD', 'bKash', 'Nagad', 'Bank'].map(m => <span key={m} className="payment-badge">{m}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <div className="container">
        <p>© {new Date().getFullYear()} Electronic Shop. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#!">Privacy Policy</a>
          <a href="#!">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
