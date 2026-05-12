import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import { Order } from '../../types';
import API from '../../utils/api';
const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{id:string}>();
  const [order, setOrder] = useState<Order|null>(null);
  useEffect(() => { API.get(`/orders/${id}`).then(({data})=>setOrder(data.order)).catch(()=>{}); }, [id]);
  return (
    <div style={{textAlign:'center',padding:'80px 20px',maxWidth:600,margin:'0 auto'}}>
      <FiCheckCircle style={{fontSize:80,color:'var(--success)',marginBottom:20}} />
      <h1 style={{fontSize:32,marginBottom:12}}>Order Placed Successfully!</h1>
      <p style={{color:'var(--gray-500)',fontSize:17,marginBottom:8}}>Thank you! A confirmation email has been sent to you.</p>
      {order && <p style={{color:'var(--primary)',fontWeight:600,fontSize:18,marginBottom:32}}>Order #{order.orderNumber}</p>}
      <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
        <Link to="/orders" className="btn btn-primary btn-lg"><FiPackage /> Track Order</Link>
        <Link to="/products" className="btn btn-outline btn-lg">Continue Shopping</Link>
      </div>
    </div>
  );
};
export default OrderSuccessPage;
