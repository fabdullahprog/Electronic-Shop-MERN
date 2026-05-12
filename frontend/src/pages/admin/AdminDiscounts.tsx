import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { code: '', description: '', type: 'percentage', value: '', minOrderAmount: 0, maxDiscountAmount: '', usageLimit: '', endDate: '', isActive: true };

const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/discount'); setDiscounts(data.discounts); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.post('/discount', { ...form, value: Number(form.value), minOrderAmount: Number(form.minOrderAmount), maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined, usageLimit: form.usageLimit ? Number(form.usageLimit) : null });
      toast.success('Coupon created!');
      setShowForm(false); setForm(emptyForm); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try { await API.delete(`/discount/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Discounts & Coupons</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><FiPlus /> Create Coupon</button>
      </div>

      {showForm && (
        <div className="card card-body" style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
            <h3>Create New Coupon</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}><FiX /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3">
              <div className="form-group"><label className="form-label">Coupon Code *</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g. SAVE20" required style={{ textTransform:'uppercase' }} /></div>
              <div className="form-group"><label className="form-label">Type *</label>
                <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (BDT)</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Value *</label><input className="form-control" type="number" min="0" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder={form.type==='percentage'?'e.g. 20':'e.g. 100'} required /></div>
            </div>
            <div className="grid grid-3">
              <div className="form-group"><label className="form-label">Min Order Amount (BDT)</label><input className="form-control" type="number" min="0" value={form.minOrderAmount} onChange={e => setForm({...form, minOrderAmount: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Max Discount (BDT)</label><input className="form-control" type="number" min="0" value={form.maxDiscountAmount} onChange={e => setForm({...form, maxDiscountAmount: e.target.value})} placeholder="Optional" /></div>
              <div className="form-group"><label className="form-label">Usage Limit</label><input className="form-control" type="number" min="1" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} placeholder="Unlimited" /></div>
            </div>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Description</label><input className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Expiry Date *</label><input className="form-control" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required /></div>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}><FiSave /> {saving ? 'Creating...' : 'Create Coupon'}</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Expires</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {discounts.map(d => (
                  <tr key={d._id}>
                    <td style={{ fontWeight:700, color:'var(--primary)', fontSize:15 }}>{d.code}</td>
                    <td><span className="badge badge-info">{d.type}</span></td>
                    <td style={{ fontWeight:600 }}>{d.type==='percentage'?`${d.value}%`:`BDT${d.value}`}</td>
                    <td>BDT{d.minOrderAmount}</td>
                    <td style={{ fontSize:13 }}>{d.usageCount} {d.usageLimit ? `/ ${d.usageLimit}` : '/ ∞'}</td>
                    <td style={{ fontSize:13, color: new Date(d.endDate) < new Date() ? 'var(--danger)' : 'var(--gray-600)' }}>{new Date(d.endDate).toLocaleDateString('en-BD')}</td>
                    <td>
                      <span className={`badge badge-${d.isActive && new Date(d.endDate) > new Date() ? 'success' : 'danger'}`}>
                        {d.isActive && new Date(d.endDate) > new Date() ? 'Active' : 'Expired/Inactive'}
                      </span>
                    </td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id, d.code)}><FiTrash2 /></button></td>
                  </tr>
                ))}
                {discounts.length===0 && <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--gray-400)' }}>No coupons yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDiscounts;
