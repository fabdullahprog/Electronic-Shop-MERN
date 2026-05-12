import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiPackage, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Category } from '../../types';
import API from '../../utils/api';
import './Header.css';

const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    API.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      {/* <div className="header-top">
        <div className="container">
          <span>Free shipping on orders over BDT 1000</span>
          <span>Support: +880 1700-000000</span>
        </div>
      </div> */}
      <div className="header-main">
        <div className="container">
          <Link to="/" className="logo">
            <span className="logo-icon"></span>
            <span className="logo-text">Electronic Shop</span>
          </Link>
          <form className="search-bar" onSubmit={handleSearch}>
            <input type="text" placeholder="Search products, brands, categories..." value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit"><FiSearch /></button>
          </form>
          <div className="header-actions">
            <Link to="/wishlist" className="action-btn" title="Wishlist"><FiHeart /></Link>
            <Link to="/cart" className="action-btn cart-btn" title="Cart">
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            {isAuthenticated ? (
              <div className="user-menu" ref={userMenuRef}>
                <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                  <span className="user-name">{user?.name?.split(' ')[0]}</span>
                  <FiChevronDown />
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile"><FiUser /> My Profile</Link>
                    <Link to="/orders"><FiPackage /> My Orders</Link>
                    <Link to="/wishlist"><FiHeart /> Wishlist</Link>
                    {isAdmin && <Link to="/admin"><FiSettings /> Admin Panel</Link>}
                    <hr />
                    <button onClick={logout}><FiLogOut /> Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </div>
            )}
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>
      <nav className={`header-nav${menuOpen ? ' open' : ''}`}>
        <div className="container">
          <Link to="/">Home</Link>
          <Link to="/products">All Products</Link>
          {categories.slice(0, 6).map(cat => (
            <Link key={cat._id} to={`/products?category=${cat._id}`}>{cat.name}</Link>
          ))}
          <Link to="/products?sort=newest">New Arrivals</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
