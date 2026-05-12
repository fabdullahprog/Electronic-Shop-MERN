import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import { Order } from '../../types';
import API from '../../utils/api';
import toast from 'react-hot-toast';
const statusColors: Record<string,string> = { pending:'warning',confirmed:'info',processing:'primary',shipped:'info',delivered:'success',cancelled:'danger' };
const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{id:string}>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order|null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  useEffect(() => { API.get(`/orders/${id}`).then(({data})=>setOrder(data.order)).catch(()=>navigate('/orders')).finally(()=>setLoading(false)); }, [id,navigate]);
  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try { const {data} = await API.put(`/orders/${id}/cancel`,{reason:'Cancelled by customer'}); setOrder(data.order); toast.success('Order cancelled'); }
    catch (err:unknown) { toast.error((err as {response?:{data?:{message?:string}}}).response?.data?.message||'Failed'); }
    finally { setCancelling(false); }
  };
  if (loading) return <div className="page-loader"><div className="spinner"/></div>;
  if (!order) return null;
  return (
    <div style={{padding:'40px 0 60px'}}><div className="container" style={{maxWidth:800}}>
      <button className="btn btn-outline btn-sm" style={{marginBottom:24}} onClick={()=>navigate('/orders')}><FiArrowLeft/> Back</button>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div><h1 style={{fontSize:24,fontWeight:700}}>Order #{order.orderNumber}</h1><p style={{color:'var(--gray-500)',fontSize:13}}>{new Date(order.createdAt).toLocaleString('en-BD')}</p></div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span className={`badge badge-${statusColors[order.orderStatus]||'primary'}`} style={{fontSize:14,padding:'6px 16px',textTransform:'capitalize'}}>{order.orderStatus}</span>
          {['pending','confirmed'].includes(order.orderStatus)&&<button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling}><FiX/> {cancelling?'Cancelling...':'Cancel Order'}</button>}
        </div>
      </div>
      <div className="card card-body" style={{marginBottom:20}}>
        <h3 style={{marginBottom:16}}>Items</h3>
        {order.items.map((item,i)=>(
          <div key={i} style={{display:'flex',gap:16,alignItems:'center',padding:'12px 0',borderBottom:'1px solid var(--gray-100)'}}>
            <img src={item.image||'https://placehold.co/70'} alt={item.name} style={{width:70,height:70,objectFit:'cover',borderRadius:8}}/>
            <div style={{flex:1}}><p style={{fontWeight:600}}>{item.name}</p>{item.size&&<p style={{fontSize:13,color:'var(--gray-500)'}}>Size: {item.size}</p>}<p style={{fontSize:13,color:'var(--gray-500)'}}>Qty: {item.quantity}</p></div>
            <p style={{fontWeight:700}}>BDT{(item.price*item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-2">
        <div className="card card-body">
          <h4 style={{marginBottom:12}}>Shipping Address</h4>
          <p style={{fontWeight:600}}>{order.shippingAddress.name}</p>
          <p style={{fontSize:14,color:'var(--gray-600)'}}>{order.shippingAddress.phone}</p>
          <p style={{fontSize:14,color:'var(--gray-600)'}}>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
        </div>
        <div className="card card-body">
          <h4 style={{marginBottom:12}}>Payment</h4>
          <p style={{fontSize:14}}>Method: <strong>{order.paymentMethod}</strong></p>
          <hr style={{margin:'12px 0',borderColor:'var(--gray-100)'}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:14,marginBottom:6}}><span>Subtotal</span><span>BDT{order.itemsPrice.toLocaleString()}</span></div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:14,marginBottom:6}}><span>Shipping</span><span>{order.shippingPrice===0?'FREE':`BDT${order.shippingPrice}`}</span></div>
          <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:17,paddingTop:8,borderTop:'2px solid var(--gray-100)'}}><span>Total</span><span>BDT{order.totalPrice.toLocaleString()}</span></div>
        </div>
      </div>
    </div></div>
  );
};
export default OrderDetailPage;
