import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './CartPage.css';

const CartPage: React.FC = () => {
  const { items, cartTotal, shippingPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="empty-state" style={{ paddingTop: 80 }}>
      <div style={{ fontSize: 80 }}></div>
      <h3>Your cart is empty</h3>
      <p>Looks like you haven't added anything yet</p>
      <Link to="/products" className="btn btn-primary mt-2">Start Shopping</Link>
    </div>
  );

  const total = cartTotal + shippingPrice;

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart <span>({items.length} items)</span></h1>
          <button className="btn btn-outline btn-sm" onClick={clearCart}>Clear All</button>
        </div>
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item, idx) => (
              <div key={idx} className="cart-item">
                <Link to={`/products/${item._id}`}>
                  <img src={item.image || 'https://placehold.co/100'} alt={item.name} className="cart-item-img" />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/products/${item._id}`} className="cart-item-name">{item.name}</Link>
                  {item.size && <span className="cart-item-variant">Size: {item.size}</span>}
                  {item.color && <span className="cart-item-variant">Color: {item.color}</span>}
                  {item.isPreOrder && <span className="badge badge-primary">Pre-Order</span>}
                  <div className="cart-item-price">BDT{item.price.toLocaleString()}</div>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)} disabled={item.quantity <= 1}><FiMinus /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)}><FiPlus /></button>
                  </div>
                  <div className="cart-item-total">BDT{(item.price * item.quantity).toLocaleString()}</div>
                  <button className="remove-btn" onClick={() => removeFromCart(item._id, item.size, item.color)}><FiTrash2 /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span><span>BDT{cartTotal.toLocaleString()}</span></div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingPrice === 0 ? <span className="text-success">FREE</span> : `BDT${shippingPrice}`}</span>
            </div>
            {shippingPrice > 0 && <p className="shipping-note">Add BDT{(1000 - cartTotal).toLocaleString()} more for free shipping</p>}
            <div className="summary-row total"><span>Total</span><span>BDT{total.toLocaleString()}</span></div>
            <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate(isAuthenticated ? '/checkout' : '/login')}>
              <FiShoppingBag /> {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
            <Link to="/products" className="continue-shopping"><FiArrowLeft /> Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
