import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import { Product, Category } from '../../types';
import API from '../../utils/api';
import './HomePage.css';

interface Feature { icon: React.ReactNode; title: string; desc: string; color: string; }

const features: Feature[] = [
  { icon: <FiTruck />, title: 'Free Delivery', desc: 'On orders over BDT 10000', color: '#31e7de' },
  { icon: <FiShield />, title: 'Secure Payment', desc: '100% secure transactions', color: '#2bb196' },
  { icon: <FiRefreshCw />, title: 'Easy Returns', desc: '7-day return policy', color: '#ca2959' },
  { icon: <FiHeadphones />, title: '24/7 Support', desc: 'Dedicated support team', color: '#cac725' },
];

const HomePage: React.FC = () => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, f, c, n] = await Promise.all([
          API.get('/products/trending'),
          API.get('/products?featured=true&limit=8'),
          API.get('/categories'),
          API.get('/products?sort=newest&limit=8'),
        ]);
        setTrendingProducts(t.data.products);
        setFeaturedProducts(f.data.products);
        setCategories(c.data.categories.slice(0, 8));
        setNewArrivals(n.data.products);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="home-page">
      {/* Hero Slider */}
      <section className="hero-section">
        <div className="hero-slide" style={{ background: 'linear-gradient(135deg,#e6f7ff 0%,#bfe9ff 100%)' }}>
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">Professional Electronics Collection</h1>
              <p className="hero-subtitle">Explore trusted devices and accessories from leading brands for home, office, and everyday performance.</p>
              <Link to="/products" className="btn btn-lg hero-btn">Shop Electronics <FiArrowRight /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon" style={{ background: f.color + '20', color: f.color }}>{f.icon}</div>
                <div><h4>{f.title}</h4><p>{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section categories-section">
          <div className="container">
            <div className="section-header">
              <div><h2 className="section-title">Shop by Category</h2><p className="section-subtitle">Find exactly what you're looking for</p></div>
              <Link to="/products" className="btn btn-outline">View All <FiArrowRight /></Link>
            </div>
            <div className="categories-grid">
              {categories.map(cat => (
                <Link key={cat._id} to={`/products?category=${cat._id}`} className="category-card">
                  <div className="category-icon">{cat.image ? <img src={cat.image} alt={cat.name} /> : <span></span>}</div>
                  <h4>{cat.name}</h4>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      {trendingProducts.length > 0 && (
        <section className="section products-section trending">
          <div className="container">
            <div className="section-header">
              <div><h2 className="section-title">Trending Products</h2><p className="section-subtitle">Most popular items this week</p></div>
              <Link to="/products?trending=true" className="btn btn-outline">View All <FiArrowRight /></Link>
            </div>
            <div className="grid grid-4">{trendingProducts.map(p => <ProductCard key={p._id} product={p} />)}</div>
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="container">
          <div className="promo-inner">
            <div className="promo-text">
              <h2>Special Offer!</h2>
              <p>Get 20% off your first order with code <strong>WELCOME20</strong></p>
              <Link to="/products" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)' }}>Shop Now <FiArrowRight /></Link>
            </div>
            <div className="promo-emoji"></div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featuredProducts.length > 0 && (
        <section className="section products-section">
          <div className="container">
            <div className="section-header">
              <div><h2 className="section-title">Featured Products</h2><p className="section-subtitle">Handpicked just for you</p></div>
              <Link to="/products?featured=true" className="btn btn-outline">View All <FiArrowRight /></Link>
            </div>
            <div className="grid grid-4">{featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}</div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section products-section new-arrivals">
          <div className="container">
            <div className="section-header">
              <div><h2 className="section-title">Latest Electronics</h2><p className="section-subtitle">Fresh picks added this week</p></div>
              <Link to="/products?sort=newest" className="btn btn-outline">View All <FiArrowRight /></Link>
            </div>
            <div className="grid grid-4">{newArrivals.map(p => <ProductCard key={p._id} product={p} />)}</div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
