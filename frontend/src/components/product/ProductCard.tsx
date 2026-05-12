import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiEye, FiPackage } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './ProductCard.css';

interface StarProps { rating: number; }
const Stars: React.FC<StarProps> = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(rating) ? '#ffc107' : '#ddd', fontSize: 14 }}>★</span>)}
    <span className="rating-text">({rating?.toFixed(1) ?? '0.0'})</span>
  </div>
);

interface ProductCardProps { product: Product; }

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => { e.preventDefault(); addToCart(product, 1); };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/wishlist/${product._id}`);
      toast.success(data.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch { toast.error('Please login to use wishlist'); }
  };

  const isOnSale = product.discountPrice > 0;
  const displayPrice = isOnSale ? product.discountPrice : product.price;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <Link to={`/products/${product.slug || product._id}`}>
          <img src={product.images?.[0]?.url || 'https://placehold.co/300x300?text=No+Image'} alt={product.name} className="product-img" loading="lazy" />
        </Link>
        <div className="product-badges">
          {isOnSale && <span className="badge-sale">-{product.discountPercent}%</span>}
          {product.isTrending && <span className="badge-trending">Trending</span>}
          {isOutOfStock && <span className="badge-preorder"><FiPackage /> Pre-Order</span>}
          {product.offerLabel && <span className="badge-offer">{product.offerLabel}</span>}
        </div>
        <div className="product-actions">
          <button className="action-icon" onClick={handleWishlist} title="Wishlist"><FiHeart /></button>
          <Link to={`/products/${product.slug || product._id}`} className="action-icon" title="View"><FiEye /></Link>
          <button className="action-icon" onClick={handleAddToCart} title="Add to Cart"><FiShoppingCart /></button>
        </div>
      </div>
      <div className="product-info">
        {product.brand && <span className="product-brand">{product.brand}</span>}
        <Link to={`/products/${product.slug || product._id}`} className="product-name">{product.name}</Link>
        <Stars rating={product.ratings} />
        <div className="product-price-row">
          <span className="product-price">BDT {displayPrice.toLocaleString()}</span>
          {isOnSale && <span className="product-old-price">BDT {product.price.toLocaleString()}</span>}
        </div>
        <button className={`btn-add-cart${isOutOfStock ? ' preorder' : ''}`} onClick={handleAddToCart}>
          {isOutOfStock ? <><FiPackage /> Pre-Order</> : <><FiShoppingCart /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
