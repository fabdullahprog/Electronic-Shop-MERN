import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', price: '',
    discountPrice: '', category: '', brand: '', stock: '',
    tags: '', isFeatured: false, isTrending: false,
    isPreOrder: false, preOrderNote: '', offerLabel: '', weight: '',
    images: []
  });

  const [variants, setVariants] = useState([]);

  useEffect(() => {
    API.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
    if (isEdit) {
      setLoading(true);
      API.get(`/products/${id}`)
        .then(({ data }) => {
          const p = data.product;
          setForm({
            name: p.name||'', description: p.description||'', shortDescription: p.shortDescription||'',
            price: p.price||'', discountPrice: p.discountPrice||'', category: p.category?._id||'',
            brand: p.brand||'', stock: p.stock||'', tags: p.tags?.join(', ')||'',
            isFeatured: p.isFeatured, isTrending: p.isTrending, isPreOrder: p.isPreOrder,
            preOrderNote: p.preOrderNote||'', offerLabel: p.offerLabel||'',
            weight: p.weight||'', images: p.images||[]
          });
          setVariants(p.variants||[]);
        })
        .catch(() => navigate('/admin/products'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setImageUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    try {
      const { data } = await API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(prev => ({ ...prev, images: [...prev.images, ...data.images] }));
      toast.success('Images uploaded!');
    } catch (err) { toast.error('Image upload failed. Check Cloudinary config.'); }
    finally { setImageUploading(false); }
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const addVariant = () => setVariants(prev => [...prev, { size: '', color: '', weight: '', sku: '', stock: 0, price: '' }]);
  const updateVariant = (idx, field, val) => setVariants(prev => prev.map((v,i) => i===idx ? {...v, [field]: val} : v));
  const removeVariant = (idx) => setVariants(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        variants,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        stock: Number(form.stock),
        weight: form.weight ? Number(form.weight) : undefined,
      };
      if (isEdit) {
        await API.put(`/products/${id}`, payload);
        toast.success('Product updated!');
      } else {
        await API.post('/products', payload);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  if (loading && isEdit) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/products')}><FiArrowLeft /></button>
        <h1 style={{ fontSize:22, fontWeight:700 }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2" style={{ alignItems:'start' }}>
          {/* Left Column */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div className="card card-body">
              <h3 style={{ marginBottom:20 }}>Basic Information</h3>
              <div className="form-group"><label className="form-label">Product Name *</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Short Description</label><input className="form-control" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} placeholder="One-liner product description" /></div>
              <div className="form-group"><label className="form-label">Full Description *</label><textarea className="form-control" rows={5} value={form.description} onChange={e => set('description', e.target.value)} required /></div>
              <div className="grid grid-2">
                <div className="form-group"><label className="form-label">Category *</label>
                  <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Brand</label><input className="form-control" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Samsung" /></div>
              </div>
              <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-control" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="electronics, mobile, android" /></div>
            </div>

            <div className="card card-body">
              <h3 style={{ marginBottom:20 }}>Pricing & Stock</h3>
              <div className="grid grid-2">
                <div className="form-group"><label className="form-label">Price (BDT) *</label><input className="form-control" type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Discount Price (BDT)</label><input className="form-control" type="number" min="0" step="0.01" value={form.discountPrice} onChange={e => set('discountPrice', e.target.value)} /></div>
              </div>
              <div className="grid grid-2">
                <div className="form-group"><label className="form-label">Stock Qty *</label><input className="form-control" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Weight (gm)</label><input className="form-control" type="number" min="0" value={form.weight} onChange={e => set('weight', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Offer Label</label><input className="form-control" value={form.offerLabel} onChange={e => set('offerLabel', e.target.value)} placeholder="e.g. Buy 2 Get 1 Free" /></div>
            </div>

            {/* Variants */}
            <div className="card card-body">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h3>Variants (Size/Color)</h3>
                <button type="button" className="btn btn-outline btn-sm" onClick={addVariant}><FiPlus /> Add Variant</button>
              </div>
              {variants.map((v, i) => (
                <div key={i} style={{ background:'var(--gray-100)', borderRadius:'var(--radius)', padding:14, marginBottom:12 }}>
                  <div className="grid grid-3" style={{ gap:10 }}>
                    <input className="form-control" placeholder="Size (e.g. S, M, L, XL)" value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} />
                    <input className="form-control" placeholder="Color (e.g. Red, Blue)" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} />
                    <input className="form-control" type="number" placeholder="Stock" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeVariant(i)}><FiTrash2 /> Remove</button>
                  </div>
                </div>
              ))}
              {variants.length===0 && <p style={{ color:'var(--gray-400)', fontSize:13 }}>No variants. Click "Add Variant" to add sizes/colors.</p>}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div className="card card-body">
              <h3 style={{ marginBottom:20 }}>Product Images</h3>
              <label style={{ display:'block', border:'2px dashed var(--gray-300)', borderRadius:'var(--radius)', padding:24, textAlign:'center', cursor:'pointer', transition:'var(--transition)', marginBottom:16 }}
                onMouseOver={e => e.currentTarget.style.borderColor='var(--primary)'}
                onMouseOut={e => e.currentTarget.style.borderColor='var(--gray-300)'}>
                <FiUpload style={{ fontSize:32, color:'var(--gray-400)', display:'block', margin:'0 auto 8px' }} />
                <p style={{ color:'var(--gray-500)', fontSize:14 }}>{imageUploading ? 'Uploading...' : 'Click to upload images'}</p>
                <p style={{ fontSize:12, color:'var(--gray-400)' }}>PNG, JPG up to 5MB each (max 5)</p>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display:'none' }} disabled={imageUploading} />
              </label>
              <p style={{ fontSize:12, color:'var(--primary)', marginBottom:12 }}>Cloudinary config required in backend .env for image upload</p>
              {form.images.length>0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position:'relative', aspectRatio:1 }}>
                      <img src={img.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'var(--radius)' }} />
                      <button type="button" onClick={() => removeImage(i)}
                        style={{ position:'absolute', top:4, right:4, background:'var(--danger)', color:'white', border:'none', borderRadius:'50%', width:22, height:22, cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        × 
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card card-body">
              <h3 style={{ marginBottom:20 }}>Settings</h3>
              {[
                { key:'isFeatured', label:'Featured Product', desc:'Show in featured section on homepage' },
                { key:'isTrending', label:'Trending Product', desc:'Show in trending slider on homepage' },
                { key:'isPreOrder', label:'Pre-Order Only', desc:'Mark as pre-order regardless of stock' },
              ].map(opt => (
                <label key={opt.key} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:'1px solid var(--gray-100)', cursor:'pointer' }}>
                  <input type="checkbox" checked={form[opt.key]} onChange={e => set(opt.key, e.target.checked)} style={{ width:18, height:18, accentColor:'var(--primary)' }} />
                  <div>
                    <p style={{ fontWeight:600, fontSize:14 }}>{opt.label}</p>
                    <p style={{ fontSize:12, color:'var(--gray-500)' }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
              {form.isPreOrder && (
                <div className="form-group" style={{ marginTop:16 }}>
                  <label className="form-label">Pre-Order Note</label>
                  <input className="form-control" value={form.preOrderNote} onChange={e => set('preOrderNote', e.target.value)} placeholder="e.g. Available in 2 weeks" />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              <FiSave /> {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
