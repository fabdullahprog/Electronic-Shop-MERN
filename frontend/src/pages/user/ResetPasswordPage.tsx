import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './AuthPages.css';
const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try { await API.put(`/auth/reset-password/${token}`, { password: form.password }); toast.success('Password reset!'); navigate('/login'); }
    catch (err: unknown) { toast.error((err as {response?:{data?:{message?:string}}}).response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="auth-page"><div className="auth-card">
      <div className="auth-logo">Electronic Shop</div>
      <h2 className="auth-title">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label className="form-label">New Password</label><div className="input-icon-wrap"><FiLock className="input-icon"/><input className="form-control" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6}/></div></div>
        <div className="form-group"><label className="form-label">Confirm Password</label><div className="input-icon-wrap"><FiLock className="input-icon"/><input className="form-control" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} required/></div></div>
        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>{loading?'Resetting...':'Reset Password'}</button>
      </form>
    </div></div>
  );
};
export default ResetPasswordPage;
