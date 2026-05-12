import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShippingAddress } from '../../types';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

type Step = 0 | 1 | 2;
const steps = ['Shipping', 'Payment', 'Review'];

interface CouponApplied { discountAmount: number; code: string; }

const CheckoutPage: React.FC = () => {
  const { items, cartTotal, shippingPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState<CouponApplied | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [payment, setPayment] = useState('COD');
  const [note, setNote] = useState('');
  const [shipping, setShipping] = useState<ShippingAddress>({ name: user?.name || '', phone: user?.phone || '', street: '', city: '', state: '', zip: '', country: 'Bangladesh' });

  if (items.length === 0) { navigate('/cart'); return null; }

  const discountAmount = couponApplied?.discountAmount || 0;
  const total = cartTotal + shippingPrice - discountAmount;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await API.post('/discount/validate', { code: coupon, cartTotal });
      setCouponApplied({ discountAmount: data.discountAmount, code: coupon });
      toast.success(`Coupon applied! You save BDT${data.discountAmount}`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Invalid coupon');
    } finally { setCouponLoading(false); }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/orders', {
        items: items.map(i => ({ product: i._id, quantity: i.quantity, size: i.size, color: i.color })),
        shippingAddress: shipping, paymentMethod: payment,
        couponCode: couponApplied ? coupon : undefined, note,
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${data.order._id}`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="steps">
          {steps.map((s, i) => (
            <div key={i} className={`step${i <= step ? ' active' : ''}${i < step ? ' done' : ''}`}>
              <div className="step-circle">{i < step ? <FiCheck /> : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-form">
            {step === 0 && (
              <div className="card card-body">
                <h3><FiMapPin /> Shipping Address</h3>
                <div className="grid grid-2" style={{ marginTop: 20 }}>
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">Phone *</label><input className="form-control" value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Street Address *</label><input className="form-control" placeholder="House, road, area" value={shipping.street} onChange={e => setShipping({ ...shipping, street: e.target.value })} required /></div>
                <div className="grid grid-2">
                  <div className="form-group"><label className="form-label">City *</label><input className="form-control" value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">District/State</label><input className="form-control" value={shipping.state || ''} onChange={e => setShipping({ ...shipping, state: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Note (optional)</label><textarea className="form-control" rows={3} value={note} onChange={e => setNote(e.target.value)} /></div>
                <button className="btn btn-primary btn-lg" onClick={() => { if (!shipping.name || !shipping.phone || !shipping.street || !shipping.city) return toast.error('Fill required fields'); setStep(1); }}>Continue to Payment →</button>
              </div>
            )}

            {step === 1 && (
              <div className="card card-body">
                <h3><FiCreditCard /> Payment Method</h3>
                <div className="payment-options">
                  {[{ value: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay when you receive', disabled: false }, { value: 'bKash', label: '📱 bKash', desc: 'Coming Soon', disabled: true }, { value: 'Nagad', label: '📱 Nagad', desc: 'Coming Soon', disabled: true }].map(opt => (
                    <label key={opt.value} className={`payment-option${payment === opt.value ? ' selected' : ''}${opt.disabled ? ' disabled' : ''}`}>
                      <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={() => !opt.disabled && setPayment(opt.value)} disabled={opt.disabled} />
                      <div><strong>{opt.label}</strong><p>{opt.desc}</p></div>
                    </label>
                  ))}
                </div>
                <div className="coupon-section">
                  <label className="form-label">Have a coupon?</label>
                  <div className="coupon-input">
                    <input className="form-control" placeholder="Enter coupon code" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} disabled={!!couponApplied} />
                    {couponApplied
                      ? <button className="btn btn-outline" onClick={() => { setCouponApplied(null); setCoupon(''); }}>Remove</button>
                      : <button className="btn btn-primary" onClick={applyCoupon} disabled={couponLoading}>{couponLoading ? '...' : 'Apply'}</button>}
                  </div>
                  {couponApplied && <p className="text-success" style={{ fontSize: 13, marginTop: 6 }}>Saving BDT{couponApplied.discountAmount}</p>}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Review Order →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="card card-body">
                <h3>Review Your Order</h3>
                <div className="review-section"><h4>Shipping to:</h4><p>{shipping.name} | {shipping.phone}</p><p>{shipping.street}, {shipping.city}{shipping.state ? `, ${shipping.state}` : ''}</p><p>{shipping.country}</p></div>
                <div className="review-section"><h4>Payment:</h4><p>{payment}</p></div>
                <div className="review-items">
                  {items.map((item, i) => (
                    <div key={i} className="review-item">
                      <img src={item.image || 'https://placehold.co/60'} alt={item.name} />
                      <div className="flex-1"><p className="fw-bold">{item.name}</p>{item.size && <p className="text-muted" style={{ fontSize: 13 }}>Size: {item.size}</p>}<p className="text-muted" style={{ fontSize: 13 }}>Qty: {item.quantity}</p></div>
                      <p className="fw-bold">BDT{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={loading} style={{ flex: 1 }}>
                    {loading ? 'Placing Order...' : `Place Order • BDT${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-summary">
            <div className="card card-body">
              <h3>Order Summary</h3>
              {items.map((item, i) => (
                <div key={i} className="summary-item">
                  <img src={item.image || 'https://placehold.co/50'} alt={item.name} />
                  <div style={{ flex: 1 }}><p style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</p><p style={{ fontSize: 12, color: 'var(--gray-500)' }}>×{item.quantity}</p></div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>BDT{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
              <hr style={{ margin: '16px 0', borderColor: 'var(--gray-100)' }} />
              <div className="summary-row"><span>Subtotal</span><span>BDT{cartTotal.toLocaleString()}</span></div>
              <div className="summary-row"><span>Shipping</span><span>{shippingPrice === 0 ? 'FREE' : `BDT${shippingPrice}`}</span></div>
              {discountAmount > 0 && <div className="summary-row text-success"><span>Discount</span><span>-BDT{discountAmount}</span></div>}
              <div className="summary-row" style={{ fontWeight: 700, fontSize: 17, marginTop: 8, paddingTop: 8, borderTop: '2px solid var(--gray-100)' }}>
                <span>Total</span><span>BDT{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
