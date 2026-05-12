import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import { Product } from '../../types';
import API from '../../utils/api';
const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { API.get('/wishlist').then(({data})=>setWishlist(data.wishlist)).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  if (loading) return <div className="page-loader"><div className="spinner"/></div>;
  return (
    <div style={{padding:'40px 0 60px'}}><div className="container">
      <h1 style={{marginBottom:28,display:'flex',alignItems:'center',gap:10}}><FiHeart color="var(--secondary)"/> My Wishlist</h1>
      {wishlist.length===0 ? (<div className="empty-state"><div style={{fontSize:64}}></div><h3>Your wishlist is empty</h3><Link to="/products" className="btn btn-primary mt-2">Browse Products</Link></div>
      ) : (<div className="grid grid-4">{wishlist.map(p=><ProductCard key={p._id} product={p}/>)}</div>)}
    </div></div>
  );
};
export default WishlistPage;
