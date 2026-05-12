import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiUsers, FiPackage, FiDollarSign, FiAlertTriangle, FiEye } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import API from '../../utils/api';

const statusColors = { pending: 'warning', confirmed: 'info', processing: 'primary', shipped: 'info', delivered: 'success', cancelled: 'danger' };

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  if (!stats) return <div className="alert alert-danger">Failed to load dashboard</div>;

  const { stats: s, recentOrders, monthlyRevenue, lowStockProducts, topProducts, ordersByStatus } = stats;

  const statCards = [

{ 
  label: 'Total Revenue', 
  value: `BDT ${(s.totalRevenue||0).toLocaleString()}`, 
  icon: <span style={{ fontSize: '20px', fontWeight: 'bold' }}>৳</span>, 
  color: '#6C63FF', 
  bg: '#EEF0FF' 
},


    // { label: 'Total Revenue', value: `BDT ${(s.totalRevenue||0).toLocaleString()}`, icon: <FiDollarSign />, color: '#6C63FF', bg: '#EEF0FF' },
    { label: 'Total Orders', value: s.totalOrders, icon: <FiShoppingBag />, color: '#43C6AC', bg: '#E8FAF7' },
    { label: 'Total Products', value: s.totalProducts, icon: <FiPackage />, color: '#FF6584', bg: '#FFF0F3' },
    { label: 'Total Users', value: s.totalUsers, icon: <FiUsers />, color: '#ffc107', bg: '#FFF9E6' },
  ];

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = monthlyRevenue.map(m => ({
    month: monthNames[m._id.month - 1],
    revenue: m.revenue,
    orders: m.orders
  }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        {statCards.map((c, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-2" style={{ marginBottom: 28 }}>
        <div className="card card-body">
          <h3 style={{ marginBottom: 20 }}>Revenue (Last 6 Months)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `BDT${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#6C63FF" strokeWidth={2.5} dot={{ fill: '#6C63FF' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '40px 0' }}>No data yet</p>}
        </div>
        <div className="card card-body">
          <h3 style={{ marginBottom: 20 }}>Orders by Status</h3>
          {ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ordersByStatus.map(o => ({ name: o._id, count: o.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6C63FF" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '40px 0' }}>No data yet</p>}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 28 }}>
        {/* Recent Orders */}
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-outline btn-sm"><FiEye /> View All</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentOrders.slice(0,8).map(o => (
                  <tr key={o._id}>
                    <td><Link to={`/admin/orders/${o._id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>#{o.orderNumber}</Link></td>
                    <td style={{ fontSize: 13 }}>{o.user?.name}</td>
                    <td style={{ fontWeight: 600 }}>BDT{o.totalPrice.toLocaleString()}</td>
                    <td><span className={`badge badge-${statusColors[o.orderStatus]||'primary'}`} style={{ textTransform: 'capitalize' }}>{o.orderStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock + Top Products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {lowStockProducts.length > 0 && (
            <div className="card card-body">
              <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiAlertTriangle color="var(--warning)" /> Low Stock Alert
              </h3>
              {lowStockProducts.map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <span style={{ fontSize: 14 }}>{p.name}</span>
                  <span className={`badge badge-${p.stock === 0 ? 'danger' : 'warning'}`}>{p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}</span>
                </div>
              ))}
            </div>
          )}
          {topProducts.length > 0 && (
            <div className="card card-body">
              <h3 style={{ marginBottom: 16 }}>Top Selling Products</h3>
              {topProducts.map((p, i) => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', width: 20 }}>#{i+1}</span>
                    <span style={{ fontSize: 14 }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{p.totalSold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
