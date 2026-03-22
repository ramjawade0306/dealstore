'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getMediaUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/admin/coupons/validate', { code: coupon, orderAmount: cartTotal });
      setCouponData(data);
      const discountAmt = data.discountType === 'Percentage'
        ? (cartTotal * data.discountAmount) / 100
        : data.discountAmount;
      setDiscount(Math.min(discountAmt, cartTotal));
      toast.success(`Coupon applied! Saved ₹${Math.round(discountAmt)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setDiscount(0); setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const finalTotal = Math.max(0, cartTotal - discount);

  if (cart.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 70, gap: 20 }}>
      <div style={{ fontSize: 80 }}>🛒</div>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#c9a84c' }}>Your Cart is Empty</h2>
      <p style={{ color: '#6b6b6b' }}>Discover our luxury collection and add items to your cart</p>
      <Link href="/products" className="btn-gold" style={{ marginTop: 16 }}>Browse Products</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container">
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', marginBottom: 8 }}>Shopping Cart</h1>
        <p style={{ color: '#6b6b6b', marginBottom: 40 }}>{cart.length} item(s)</p>

        <div style={{ gridTemplateColumns: '1fr 360px', display: 'grid', gap: 32, alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cart.map((item, i) => (
              <div key={i} style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: 20, display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ width: 90, height: 90, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                  {item.images?.[0] ? <img src={getMediaUrl(item.images[0])} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏷️</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#c9a84c', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.brand}</p>
                  <h3 style={{ fontSize: '1rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h3>
                  {item.size && <p style={{ color: '#6b6b6b', fontSize: 13 }}>Size: {item.size}</p>}
                  <p style={{ color: '#e8c97a', fontWeight: 700, fontSize: '1.1rem', marginTop: 4 }}>₹{item.discountPrice?.toLocaleString('en-IN')}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, overflow: 'hidden' }}>
                    <button onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)} style={{ width: 34, height: 34, background: '#0a0a0a', border: 'none', color: '#f9f6ef', fontSize: 16, cursor: 'pointer' }}>−</button>
                    <span style={{ width: 40, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)} style={{ width: 34, height: 34, background: '#0a0a0a', border: 'none', color: '#f9f6ef', fontSize: 16, cursor: 'pointer' }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item._id, item.size)} style={{ background: 'none', border: 'none', color: '#f44336', fontSize: 20, cursor: 'pointer' }} title="Remove">🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: 28, position: 'sticky', top: 90 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', marginBottom: 24 }}>Order Summary</h2>

            {/* Coupon */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: '#6b6b6b', fontSize: 13, marginBottom: 10 }}>Apply Coupon Code</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input-luxury" placeholder="COUPON CODE" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} style={{ flex: 1, padding: '10px 14px', fontSize: 14 }} />
                <button onClick={applyCoupon} className="btn-gold" style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }} disabled={couponLoading}>
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b6b6b', fontSize: 14 }}>
                <span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4CAF50', fontSize: 14 }}>
                  <span>Coupon Discount</span><span>−₹{Math.round(discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b6b6b', fontSize: 14 }}>
                <span>Delivery</span><span style={{ color: '#4CAF50' }}>FREE</span>
              </div>
            </div>
            <div className="gold-line" style={{ opacity: 0.4, marginBottom: 16 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem' }}>Total</span>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#e8c97a', fontWeight: 700 }}>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>

            {user?.role === 'admin' ? (
              <div style={{ background: 'transparent', color: '#f44336', padding: 14, borderRadius: 8, textAlign: 'center', fontSize: 13, border: '1px solid rgba(244,67,54,0.3)', marginBottom: 8 }}>
                ⚠️ Admin accounts cannot place orders.
              </div>
            ) : (
              <Link href="/checkout" className="btn-gold" style={{ display: 'block', textAlign: 'center', padding: 14, fontSize: 15 }}>
                Proceed to Checkout →
              </Link>
            )}
            <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#6b6b6b', fontSize: 13, marginTop: 16, width: '100%', cursor: 'pointer', textDecoration: 'underline' }}>
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
