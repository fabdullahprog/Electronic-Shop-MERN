import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiEye, FiFilter } from 'react-icons/fi';
import API from '../../utils/api';

const statusColors = { pending:'warning', confirmed:'info', processing:'primary', shipped:'info', delivered:'success', cancelled:'danger', returned:'danger' };
const allStatuses = ['all','pending','confirmed','processing','shipped','delivered','cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);
      const { data } = await API.get(`/orders/admin?${params}`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [status, page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchOrders(); };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Orders Management</h1>
        <span style={{ background:'var(--primary-light)', color:'var(--primary)', padding:'6px 16px', borderRadius:20, fontWeight:600 }}>{total} Total</span>
      </div>

      {/* Filters */}
      <div className="card card-body" style={{ marginBottom:20, display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
        <form onSubmit={handleSearch} style={{ display:'flex', gap:8 }}>
          <div className="search-input">
            <FiSearch color="var(--gray-400)" />
            <input placeholder="Search order number..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm" type="submit">Search</button>
        </form>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {allStatuses.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`btn btn-sm${status === s ? ' btn-primary' : ' btn-outline'}`}
              style={{ textTransform:'capitalize' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="page-loader"><div className="spinner"></div></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th><th>Customer</th><th>Date</th>
                  <th>Items</th><th>Total</th><th>Payment</th>
                  <th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td><Link to={`/admin/orders/${o._id}`} style={{ color:'var(--primary)', fontWeight:600 }}>#{o.orderNumber}</Link></td>
                    <td>
                      <div style={{ fontWeight:500 }}>{o.user?.name}</div>
                      <div style={{ fontSize:12, color:'var(--gray-500)' }}>{o.user?.email}</div>
                    </td>
                    <td style={{ fontSize:13, color:'var(--gray-500)' }}>{new Date(o.createdAt).toLocaleDateString('en-BD')}</td>
                    <td style={{ textAlign:'center' }}>{o.items?.length}</td>
                    <td style={{ fontWeight:700 }}>BDT{o.totalPrice.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${o.paymentStatus==='paid'?'success':'warning'}`}>{o.paymentMethod}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${statusColors[o.orderStatus]||'primary'}`} style={{ textTransform:'capitalize' }}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${o._id}`} className="btn btn-outline btn-sm"><FiEye /></Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:'40px', color:'var(--gray-400)' }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="pagination">
          <button disabled={page<=1} onClick={() => setPage(p=>p-1)}>‹</button>
          {Array.from({ length: Math.ceil(total/limit) }, (_,i) => i+1).slice(0,10).map(p => (
            <button key={p} className={page===p?'active':''} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button disabled={page>=Math.ceil(total/limit)} onClick={() => setPage(p=>p+1)}>›</button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
