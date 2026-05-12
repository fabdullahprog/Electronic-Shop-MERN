import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './AuthPages.css';
const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await API.post('/auth/forgot-password', { email }); setSent(true); toast.success('Reset email sent!'); }
    catch (err: unknown) { toast.error((err as {response?:{data?:{message?:string}}}).response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="auth-page"><div className="auth-card">
      <div className="auth-logo">Electronic Shop</div>
      {sent ? (<div style={{textAlign:'center'}}><div style={{fontSize:64,marginBottom:16}}></div><h2>Check your email!</h2><p style={{color:'var(--gray-500)',margin:'12px 0 24px'}}>Reset link sent to <strong>{email}</strong></p><Link to="/login" className="btn btn-primary">Back to Login</Link></div>
      ) : (<><h2 className="auth-title">Forgot Password?</h2><p className="auth-subtitle">We'll send you a reset link</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Email Address</label><div className="input-icon-wrap"><FiMail className="input-icon"/><input className="form-control" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div></div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>{loading?'Sending...':'Send Reset Link'}</button>
        </form>
        <p className="auth-switch"><Link to="/login">← Back to Login</Link></p></>)}
    </div></div>
  );
};
export default ForgotPasswordPage;
