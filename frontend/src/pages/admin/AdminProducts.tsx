import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const fetchProducts = async (kw = search, pg = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit, keyword: kw });
      const { data } = await API.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProducts(search, 1); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleToggleTrending = async (id, current) => {
    try {
      await API.put(`/products/${id}`, { isTrending: !current });
      toast.success('Updated!');
      fetchProducts();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Products Management</h1>
        <Link to="/admin/products/new" className="btn btn-primary"><FiPlus /> Add Product</Link>
      </div>

      <div className="card card-body" style={{ marginBottom:20, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <form onSubmit={handleSearch} style={{ display:'flex', gap:8 }}>
          <div className="search-input">
            <FiSearch color="var(--gray-400)" />
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm" type="submit">Search</button>
        </form>
        <span style={{ marginLeft:'auto', color:'var(--gray-500)', fontSize:14 }}>{total} products</span>
      </div>

      <div className="admin-table-wrap">
        {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Trending</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <img src={p.images?.[0]?.url||'https://via.placeholder.com/48'} alt={p.name} style={{ width:48, height:48, objectFit:'cover', borderRadius:8 }} />
                        <div>
                          <p style={{ fontWeight:600, fontSize:14 }}>{p.name}</p>
                          {p.brand && <p style={{ fontSize:12, color:'var(--gray-500)' }}>{p.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:13 }}>{p.category?.name||'—'}</td>
                    <td>
                      <div style={{ fontWeight:700 }}>BDT{(p.discountPrice||p.price).toLocaleString()}</div>
                      {p.discountPrice>0 && <div style={{ fontSize:12, color:'var(--gray-400)', textDecoration:'line-through' }}>BDT{p.price.toLocaleString()}</div>}
                    </td>
                    <td>
                      <span className={`badge badge-${p.stock===0?'danger':p.stock<=5?'warning':'success'}`}>
                        {p.stock===0?'Out of Stock':p.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${p.isActive?'success':'danger'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleTrending(p._id, p.isTrending)}
                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:20 }}
                        title="Toggle Trending"
                      >
                        {p.isTrending ? '' : ''}
                      </button>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:8 }}>
                        <Link to={`/admin/products/${p._id}/edit`} className="btn btn-outline btn-sm"><FiEdit2 /></Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id, p.name)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length===0 && <tr><td colSpan={7} style={{ textAlign:'center', padding:'40px', color:'var(--gray-400)' }}>No products found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > limit && (
        <div className="pagination">
          <button disabled={page<=1} onClick={() => setPage(p=>p-1)}>‹</button>
          {Array.from({length:Math.ceil(total/limit)},(_,i)=>i+1).slice(0,10).map(p => (
            <button key={p} className={page===p?'active':''} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button disabled={page>=Math.ceil(total/limit)} onClick={() => setPage(p=>p+1)}>›</button>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
