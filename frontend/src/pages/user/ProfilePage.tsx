import React, { useState } from 'react';
import { FiUser, FiSave, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import API from '../../utils/api';
import toast from 'react-hot-toast';
const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'' });
  const [passForm, setPassForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { const {data} = await API.put('/auth/update-profile', form); updateUser(data.user as User); toast.success('Profile updated!'); }
    catch (err:unknown) { toast.error((err as {response?:{data?:{message?:string}}}).response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };
  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword!==passForm.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try { await API.put('/auth/change-password', passForm); toast.success('Password changed!'); setPassForm({currentPassword:'',newPassword:'',confirmPassword:''}); }
    catch (err:unknown) { toast.error((err as {response?:{data?:{message?:string}}}).response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{padding:'40px 0 60px'}}><div className="container" style={{maxWidth:700}}>
      <h1 style={{marginBottom:32}}>My Profile</h1>
      <div className="card card-body" style={{marginBottom:24}}>
        <h3 style={{marginBottom:20,display:'flex',alignItems:'center',gap:10}}><FiUser/> Personal Information</h3>
        <form onSubmit={handleProfile}>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={user?.email} disabled style={{background:'var(--gray-100)'}}/></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          <button className="btn btn-primary" type="submit" disabled={loading}><FiSave/> {loading?'Saving...':'Save Changes'}</button>
        </form>
      </div>
      <div className="card card-body">
        <h3 style={{marginBottom:20,display:'flex',alignItems:'center',gap:10}}><FiLock/> Change Password</h3>
        <form onSubmit={handlePassword}>
          {['currentPassword','newPassword','confirmPassword'].map((k,i)=>(
            <div className="form-group" key={k}><label className="form-label">{['Current Password','New Password','Confirm Password'][i]}</label><input className="form-control" type="password" value={passForm[k as keyof typeof passForm]} onChange={e=>setPassForm({...passForm,[k]:e.target.value})} required minLength={k!=='currentPassword'?6:undefined}/></div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading}><FiLock/> {loading?'Changing...':'Change Password'}</button>
        </form>
      </div>
    </div></div>
  );
};
export default ProfilePage;
