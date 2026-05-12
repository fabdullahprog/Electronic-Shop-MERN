import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiPackage, FiTruck, FiShield, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/product/ProductCard';
import { Product, Review } from '../../types';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const Stars: React.FC<{ rating: number; count: number }> = ({ rating, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(rating) ? '#ffc107' : '#ddd', fontSize: 20 }}></span>)}
    <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>({count} reviews)</span>
  </div>
);

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    API.get(`/products/${id}`)
      .then(async ({ data }) => {
        setProduct(data.product);
        setSelectedImage(0); setSelectedSize(''); setSelectedColor(''); setQuantity(1);
        const [rel, rev] = await Promise.allSettled([
          API.get(`/products/${data.product._id}/related`),
          API.get(`/reviews/product/${data.product._id}`),
        ]);
        if (rel.status === 'fulfilled') setRelated(rel.value.data.products);
        if (rev.status === 'fulfilled') setReviews(rev.value.data.reviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!product) return <div className="empty-state"><h3>Product not found</h3></div>;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const isOutOfStock = product.stock === 0;
  const sizes = [...new Set(product.variants?.map(v => v.size).filter((s): s is string => !!s))];
  const colors = [...new Set(product.variants?.map(v => v.color).filter((c): c is string => !!c))];

  const handleAddToCart = () => { addToCart({ ...product }, quantity, selectedSize, selectedColor); };
  const handleWishlist = async () => {
    try {
      const { data } = await API.put(`/wishlist/${product._id}`);
      toast.success(data.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch { toast.error('Please login to use wishlist'); }
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link><FiChevronRight />
          <Link to="/products">Products</Link><FiChevronRight />
          {product.category && <><Link to={`/products?category=${product.category._id}`}>{product.category.name}</Link><FiChevronRight /></>}
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          <div className="product-images">
            <div className="main-image">
              <img src={product.images?.[selectedImage]?.url || 'https://placehold.co/500?text=No+Image'} alt={product.name} />
              {isOutOfStock && <div className="out-of-stock-overlay"><FiPackage /> Pre-Order Available</div>}
            </div>
            {product.images?.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((img, i) => (
                  <img key={i} src={img.url} alt="" className={selectedImage === i ? 'active' : ''} onClick={() => setSelectedImage(i)} />
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-info">
            {product.brand && <span className="detail-brand">{product.brand}</span>}
            <h1 className="detail-title">{product.name}</h1>
            <Stars rating={product.ratings} count={product.numReviews} />

            <div className="detail-price-section">
              <span className="detail-price">BDT{displayPrice.toLocaleString()}</span>
              {product.discountPrice > 0 && <>
                <span className="detail-old-price">BDT{product.price.toLocaleString()}</span>
                <span className="detail-discount">-{product.discountPercent}% OFF</span>
              </>}
            </div>

            {product.shortDescription && <p className="detail-short-desc">{product.shortDescription}</p>}
            <div className="detail-stock">
              {isOutOfStock
                ? <span style={{ color: 'var(--warning)', fontWeight: 600 }}><FiPackage /> Pre-Order — Out of Stock</span>
                : <span style={{ color: 'var(--success)', fontWeight: 600 }}>In Stock ({product.stock} available)</span>}
            </div>

            {sizes.length > 0 && (
              <div className="detail-variant">
                <label>Size:</label>
                <div className="variant-options">
                  {sizes.map(s => <button key={s} className={`variant-btn${selectedSize === s ? ' selected' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>)}
                </div>
              </div>
            )}
            {colors.length > 0 && (
              <div className="detail-variant">
                <label>Color:</label>
                <div className="variant-options">
                  {colors.map(c => <button key={c} className={`variant-btn${selectedColor === c ? ' selected' : ''}`} onClick={() => setSelectedColor(c)}>{c}</button>)}
                </div>
              </div>
            )}

            <div className="detail-qty">
              <label>Quantity:</label>
              <div className="qty-control">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
            </div>

            <div className="detail-actions">
              <button className={`btn btn-lg${isOutOfStock ? ' btn-outline' : ' btn-primary'}`} style={{ flex: 1 }} onClick={handleAddToCart}>
                {isOutOfStock ? <><FiPackage /> Pre-Order</> : <><FiShoppingCart /> Add to Cart</>}
              </button>
              <button className="btn btn-outline btn-lg" onClick={handleWishlist}><FiHeart /></button>
              <button className="btn btn-outline btn-lg" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}><FiShare2 /></button>
            </div>

            <div className="detail-features">
              <div className="detail-feature"><FiTruck /> <span>Free delivery on orders over BDT 1000</span></div>
              <div className="detail-feature"><FiShield /> <span>7-day easy returns</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <div className="tab-nav">
            {(['description', 'reviews'] as const).map(tab => (
              <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'description' ? 'Description' : `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>
          <div className="tab-content card card-body">
            {activeTab === 'description' && (
              <div className="product-description">
                <p>{product.description}</p>
                {product.tags?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <strong>Tags: </strong>
                    {product.tags.map(t => <span key={t} className="badge badge-primary" style={{ marginRight: 6 }}>{t}</span>)}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {reviews.length === 0 ? <p style={{ color: 'var(--gray-500)' }}>No reviews yet.</p> : reviews.map(r => (
                  <div key={r._id} className="review-item-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div className="avatar" style={{ width: 36, height: 36, background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{r.user?.name?.charAt(0)}</div>
                      <div>
                        <strong>{r.user?.name}</strong>
                        {r.isVerifiedPurchase && <span className="badge badge-success" style={{ marginLeft: 8, fontSize: 11 }}>Verified</span>}
                        <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= r.rating ? '#ffc107' : '#ddd' }}></span>)}</div>
                    </div>
                    <p style={{ color: 'var(--gray-700)' }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="section">
            <h2 className="section-title">Related Products</h2>
            <div className="grid grid-4">{related.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
