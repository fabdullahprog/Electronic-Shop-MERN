import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import { Order } from '../../types';
import API from '../../utils/api';
const statusColors: Record<string,string> = { pending:'warning',confirmed:'info',processing:'primary',shipped:'info',delivered:'success',cancelled:'danger' };
const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { API.get('/orders/my-orders').then(({data})=>setOrders(data.orders)).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  if (loading) return <div className="page-loader"><div className="spinner"/></div>;
  return (
    <div style={{padding:'40px 0 60px'}}><div className="container">
      <h1 style={{marginBottom:28}}>My Orders</h1>
      {orders.length===0 ? (
        <div className="empty-state"><div style={{fontSize:64}}></div><h3>No orders yet</h3><p>You haven't placed any orders yet</p><Link to="/products" className="btn btn-primary mt-2">Start Shopping</Link></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {orders.map(o=>(
            <div key={o._id} className="card card-body" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
              <div><p style={{fontWeight:700,fontSize:16}}>#{o.orderNumber}</p><p style={{fontSize:13,color:'var(--gray-500)'}}>{new Date(o.createdAt).toLocaleDateString('en-BD')} • {o.items.length} item(s)</p></div>
              <span className={`badge badge-${statusColors[o.orderStatus]||'primary'}`} style={{textTransform:'capitalize'}}>{o.orderStatus}</span>
              <div style={{fontWeight:700,fontSize:17}}>BDT{o.totalPrice.toLocaleString()}</div>
              <Link to={`/orders/${o._id}`} className="btn btn-outline btn-sm"><FiEye /> Details</Link>
            </div>
          ))}
        </div>
      )}
    </div></div>
  );
};
export default OrdersPage;
