import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag, FiPercent, FiMenu, FiX, FiLogOut, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

interface NavItem { path: string; label: string; icon: React.ReactNode; }

const navItems: NavItem[] = [
  { path: '/admin', label: 'Dashboard', icon: <FiGrid /> },
  { path: '/admin/orders', label: 'Orders', icon: <FiShoppingBag /> },
  { path: '/admin/products', label: 'Products', icon: <FiPackage /> },
  { path: '/admin/categories', label: 'Categories', icon: <FiTag /> },
  { path: '/admin/users', label: 'Users', icon: <FiUsers /> },
  { path: '/admin/discounts', label: 'Discounts', icon: <FiPercent /> },
];

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };
  const currentPage = navItems.find(n => n.path === location.pathname)?.label || 'Admin Panel';

  return (
    <div className={`admin-layout${sidebarOpen ? '' : ' collapsed'}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/admin" className="admin-logo">{sidebarOpen && 'Electronic Shop'}</Link>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        <div className="sidebar-user">
          <div className="avatar">{user?.name?.charAt(0)}</div>
          {sidebarOpen && <div><p className="sidebar-name">{user?.name}</p><p className="sidebar-role">Administrator</p></div>}
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`nav-item${location.pathname === item.path ? ' active' : ''}`} title={!sidebarOpen ? item.label : ''}>
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <><span className="nav-label">{item.label}</span><FiChevronRight className="nav-arrow" /></>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="nav-item" title="View Store">
            <span className="nav-icon"></span>
            {sidebarOpen && <span className="nav-label">View Store</span>}
          </Link>
          <button className="nav-item logout-btn" onClick={handleLogout} title="Logout">
            <span className="nav-icon"><FiLogOut /></span>
            {sidebarOpen && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="mobile-sidebar-btn" onClick={() => setSidebarOpen(!sidebarOpen)}><FiMenu /></button>
          <h2 className="topbar-title">{currentPage}</h2>
          <div className="topbar-right">
            <span className="admin-badge">Admin</span>
            <div className="avatar">{user?.name?.charAt(0)}</div>
          </div>
        </div>
        <div className="admin-content"><Outlet /></div>
      </main>
    </div>
  );
};

export default AdminLayout;
