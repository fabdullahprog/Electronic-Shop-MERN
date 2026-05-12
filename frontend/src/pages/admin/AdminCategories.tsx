import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', parent: '', discount: 0, isActive: true };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/categories'); setCategories(data.categories); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setForm({ name: cat.name, description: cat.description||'', parent: cat.parent?._id||'', discount: cat.discount||0, isActive: cat.isActive });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) { await API.put(`/categories/${editId}`, form); toast.success('Category updated!'); }
      else { await API.post('/categories', form); toast.success('Category created!'); }
      setShowForm(false); setEditId(null); setForm(emptyForm); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await API.delete(`/categories/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Categories</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}><FiPlus /> Add Category</button>
      </div>

      {showForm && (
        <div className="card card-body" style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
            <h3>{editId ? 'Edit Category' : 'New Category'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}><FiX /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Category Name *</label><input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Parent Category</label>
                <select className="form-control" value={form.parent} onChange={e => setForm({...form, parent: e.target.value})}>
                  <option value="">None (Top Level)</option>
                  {categories.filter(c => c._id !== editId).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Description</label><input className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Discount (%)</label><input className="form-control" type="number" min="0" max="100" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} /></div>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}><FiSave /> {saving ? 'Saving...' : 'Save'}</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Parent</th><th>Discount</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight:600 }}>{c.name}</td>
                    <td style={{ fontSize:13, color:'var(--gray-500)' }}>{c.parent?.name || '—'}</td>
                    <td>{c.discount > 0 ? <span className="badge badge-warning">{c.discount}% OFF</span> : '—'}</td>
                    <td><span className={`badge badge-${c.isActive?'success':'danger'}`}>{c.isActive?'Active':'Inactive'}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(c)}><FiEdit2 /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id, c.name)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', padding:40, color:'var(--gray-400)' }}>No categories yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminCategories;
