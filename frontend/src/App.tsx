import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/admin/AdminLayout';

// User Pages
import HomePage from './pages/user/HomePage';
import ProductsPage from './pages/user/ProductsPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import OrderSuccessPage from './pages/user/OrderSuccessPage';
import OrdersPage from './pages/user/OrdersPage';
import OrderDetailPage from './pages/user/OrderDetailPage';
import ProfilePage from './pages/user/ProfilePage';
import WishlistPage from './pages/user/WishlistPage';

// Auth Pages
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';
import VerifyEmailPage from './pages/user/VerifyEmailPage';
import ForgotPasswordPage from './pages/user/ForgotPasswordPage';
import ResetPasswordPage from './pages/user/ResetPasswordPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminDiscounts from './pages/admin/AdminDiscounts';

interface ProtectedRouteProps { children: ReactNode; }

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const UserLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <>
    <Header />
    <main style={{ minHeight: '70vh' }}>{children}</main>
    <Footer />
  </>
);

const NotFound: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '100px 20px' }}>
    <h2 style={{ fontSize: 48, color: 'var(--primary)' }}>404</h2>
    <h3>Page Not Found</h3>
    <a href="/" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 20 }}>Go Home</a>
  </div>
);

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<UserLayout><HomePage /></UserLayout>} />
          <Route path="/products" element={<UserLayout><ProductsPage /></UserLayout>} />
          <Route path="/products/:id" element={<UserLayout><ProductDetailPage /></UserLayout>} />
          <Route path="/cart" element={<UserLayout><CartPage /></UserLayout>} />
          <Route path="/wishlist" element={<UserLayout><WishlistPage /></UserLayout>} />
          <Route path="/checkout" element={<ProtectedRoute><UserLayout><CheckoutPage /></UserLayout></ProtectedRoute>} />
          <Route path="/order-success/:id" element={<ProtectedRoute><UserLayout><OrderSuccessPage /></UserLayout></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><UserLayout><OrdersPage /></UserLayout></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><UserLayout><OrderDetailPage /></UserLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserLayout><ProfilePage /></UserLayout></ProtectedRoute>} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="discounts" element={<AdminDiscounts />} />
          </Route>

          <Route path="*" element={<UserLayout><NotFound /></UserLayout>} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  </Router>
);

export default App;
