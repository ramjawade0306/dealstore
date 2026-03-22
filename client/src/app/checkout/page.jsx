'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: address, 2: payment
  const [settings, setSettings] = useState({ codEnabled: false });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', street: '', city: '', state: '', zipCode: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('Online');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    setSettingsLoading(true);
    api.get('/public/settings')
      .then(({ data }) => setSettings(data))
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, [user]);

  const handleInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.street || !form.city || !form.state || !form.zipCode) return toast.error('Please fill all address fields');
    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({ product: item._id, quantity: item.quantity, price: item.discountPrice, size: item.size })),
        shippingAddress: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode },
        paymentMethod,
        totalAmount: cartTotal,
      };
      const { data } = await api.post('/orders', orderData);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      router.push(`/profile/orders?success=true`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 70 }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#c9a84c', fontSize: '2rem' }}>Cart is Empty</h2>
      <a href="/products" className="btn-gold" style={{ marginTop: 24, display: 'inline-block' }}>Shop Now</a>
    </div>
  );

  return (
    <div style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', marginBottom: 40 }}>Checkout</h1>

        {/* Steps */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 40, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.2)' }}>
          {['Delivery Address', 'Payment'].map((s, i) => (
            <div key={s} style={{ flex: 1, padding: '14px', textAlign: 'center', background: step === i + 1 ? 'linear-gradient(135deg, #c9a84c, #e8c97a)' : '#161616', color: step === i + 1 ? '#0a0a0a' : '#6b6b6b', fontWeight: step === i + 1 ? 700 : 400, fontSize: 14, letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.3s' }}
              onClick={() => i === 0 || step > 1 ? setStep(i + 1) : null}>
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: 24 }}>Delivery Address</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { name: 'name', placeholder: 'Full Name', label: 'Name' },
                { name: 'phone', placeholder: user?.phoneNumber || '+91XXXXXXXXXX', label: 'Phone' },
                { name: 'street', placeholder: 'Street address / Flat No.', label: 'Street', full: true },
                { name: 'city', placeholder: 'City', label: 'City' },
                { name: 'state', placeholder: 'State', label: 'State' },
                { name: 'zipCode', placeholder: 'PIN Code', label: 'PIN Code' },
              ].map(field => (
                <div key={field.name} style={{ gridColumn: field.full ? '1 / -1' : 'auto' }}>
                  <label style={{ color: '#6b6b6b', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{field.label}</label>
                  <input name={field.name} className="input-luxury" placeholder={field.placeholder} value={form[field.name]} onChange={handleInput} />
                </div>
              ))}
            </div>
            <button className="btn-gold" style={{ marginTop: 28, padding: '14px 36px', fontSize: 15 }} onClick={() => {
              if (!form.name || !form.phone || !form.street || !form.city || !form.state || !form.zipCode) return toast.error('Please fill all address fields first');
              setStep(2);
            }}>
              Continue to Payment →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: 24 }}>Payment Method</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {/* Online Payment */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: paymentMethod === 'Online' ? 'rgba(201,168,76,0.08)' : '#0a0a0a', border: `2px solid ${paymentMethod === 'Online' ? '#c9a84c' : 'rgba(201,168,76,0.15)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.3s' }}>
                <input type="radio" name="payment" value="Online" checked={paymentMethod === 'Online'} onChange={() => setPaymentMethod('Online')} style={{ accentColor: '#c9a84c' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>💳 Online Payment (PhonePe)</p>
                  <p style={{ color: '#6b6b6b', fontSize: 13 }}>Pay securely via PhonePe</p>
                </div>
                <span className="badge-gold">Recommended</span>
              </label>

              {/* COD */}
              {!settingsLoading && settings.codEnabled && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: paymentMethod === 'COD' ? 'rgba(201,168,76,0.08)' : '#0a0a0a', border: `2px solid ${paymentMethod === 'COD' ? '#c9a84c' : 'rgba(201,168,76,0.15)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.3s' }}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ accentColor: '#c9a84c' }} />
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>💵 Cash on Delivery</p>
                    <p style={{ color: '#6b6b6b', fontSize: 13 }}>Pay when your order arrives</p>
                  </div>
                </label>
              )}
              {settingsLoading && (
                <div style={{ padding: 20, textAlign: 'center', color: '#6b6b6b', fontSize: 13, border: '1px dashed rgba(201,168,76,0.2)', borderRadius: 12 }}>
                  Loading payment options...
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div style={{ background: '#0a0a0a', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', marginBottom: 16 }}>Order Summary</h3>
              {cart.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: '#6b6b6b' }}>{item.title} × {item.quantity}{item.size ? ` (${item.size})` : ''}</span>
                  <span style={{ color: '#e8c97a' }}>₹{(item.discountPrice * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {settings.deliveryCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: '#6b6b6b' }}>Delivery Charge</span>
                  <span style={{ color: '#e8c97a' }}>₹{settings.deliveryCharge}</span>
                </div>
              )}
              <div className="gold-line" style={{ opacity: 0.3, margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Total</span>
                <span style={{ color: '#e8c97a' }}>₹{(cartTotal + (settings.deliveryCharge || 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-outline" onClick={() => setStep(1)} style={{ padding: '14px 24px' }}>← Back</button>
              <button className="btn-gold" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={placeOrder} disabled={loading}>
                {loading ? 'Placing Order...' : `Place Order · ₹${(cartTotal + (settings.deliveryCharge || 0)).toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
