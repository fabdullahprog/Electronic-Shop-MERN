import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';
const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    const result = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
    if (result.success) navigate('/login');
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Electronic Shop</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join us and start shopping!</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[{icon:<FiUser/>,label:'Full Name',type:'text',key:'name',ph:'Your full name'},{icon:<FiMail/>,label:'Email',type:'email',key:'email',ph:'your@email.com'},{icon:<FiPhone/>,label:'Phone',type:'tel',key:'phone',ph:'+880 1700-000000'}].map(f=>(
            <div className="form-group" key={f.key}><label className="form-label">{f.label}</label>
              <div className="input-icon-wrap">{f.icon}<input className="form-control" type={f.type} placeholder={f.ph} value={form[f.key as keyof typeof form]} onChange={e=>setForm({...form,[f.key]:e.target.value})} required={f.key!=='phone'} /></div></div>
          ))}
          <div className="form-group"><label className="form-label">Password</label>
            <div className="input-icon-wrap"><FiLock className="input-icon"/><input className="form-control" type={showPass?'text':'password'} placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/><button type="button" className="pass-toggle" onClick={()=>setShowPass(!showPass)}>{showPass?<FiEyeOff/>:<FiEye/>}</button></div></div>
          <div className="form-group"><label className="form-label">Confirm Password</label>
            <div className="input-icon-wrap"><FiLock className="input-icon"/><input className="form-control" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} required/></div></div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>{loading?'Creating account...':'Create Account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};
export default RegisterPage;
