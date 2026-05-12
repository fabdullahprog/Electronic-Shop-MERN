import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';
const LoginPage: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) navigate(result.role === 'admin' ? '/admin' : '/');
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Electronic Shop</div>
        <h2 className="auth-title">Welcome Back!</h2>
        <p className="auth-subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Email Address</label>
            <div className="input-icon-wrap"><FiMail className="input-icon" /><input className="form-control" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div></div>
          <div className="form-group"><label className="form-label">Password</label>
            <div className="input-icon-wrap"><FiLock className="input-icon" /><input className="form-control" type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /><button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>{showPass ? <FiEyeOff /> : <FiEye />}</button></div></div>
          <div className="auth-links-row"><Link to="/forgot-password">Forgot password?</Link></div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
};
export default LoginPage;
