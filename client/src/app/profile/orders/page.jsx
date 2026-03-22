'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { getMediaUrl } from '@/lib/utils';

const STATUS_STEPS = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [replaceModal, setReplaceModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [replaceReason, setReplaceReason] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchOrders();
  }, [user]);

  const fetchOrders = () => {
    api.get('/orders/my').then(({ data }) => setOrders(data)).catch(() => toast.error('Failed to load orders')).finally(() => setLoading(false));
  };

  const cancelOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`, { reason: cancelReason });
      toast.success('Order cancelled');
      setCancelModal(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const submitReplacement = async (orderId) => {
    try {
      await api.post('/replacements', { orderId, reason: replaceReason, proofImages: [] });
      toast.success('Replacement request submitted!');
      setReplaceModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  };

  const statusColor = (s) => {
    const m = { 'Order Placed': '#c9a84c', 'Packed': '#2196F3', 'Shipped': '#9C27B0', 'Out for Delivery': '#FF9800', 'Delivered': '#4CAF50', 'Cancelled': '#f44336' };
    return m[s] || '#6b6b6b';
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 70 }}><div className="loader-gold" /></div>;

  return (
    <div style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container">
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', marginBottom: 8 }}>My Orders</h1>
        <p style={{ color: '#6b6b6b', marginBottom: 40 }}>{orders.length} order(s) found</p>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>📦</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#c9a84c', fontSize: '2rem' }}>No orders yet</h2>
            <Link href="/products" className="btn-gold" style={{ display: 'inline-block', marginTop: 24 }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {orders.map(order => {
              const canCancel = ['Order Placed', 'Packed'].includes(order.orderStatus);
              const canReplace = order.orderStatus === 'Delivered';
              const stepIdx = STATUS_STEPS.indexOf(order.orderStatus);

              return (
                <div key={order._id} style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 16, padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <p style={{ color: '#6b6b6b', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Order ID</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#c9a84c' }}>#{order._id.slice(-8).toUpperCase()}</p>
                      <p style={{ color: '#6b6b6b', fontSize: 12, marginTop: 4 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ padding: '6px 14px', borderRadius: 50, background: `${statusColor(order.orderStatus)}20`, color: statusColor(order.orderStatus), fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>
                        {order.orderStatus}
                      </span>
                      <p style={{ color: '#e8c97a', fontSize: '1.2rem', fontWeight: 700, marginTop: 8 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  {order.orderStatus !== 'Cancelled' && (
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, overflowX: 'auto', gap: 0 }}>
                      {STATUS_STEPS.map((s, i) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 80 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= stepIdx ? '#c9a84c' : '#2a2a2a', border: `2px solid ${i <= stepIdx ? '#c9a84c' : '#2a2a2a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                              {i < stepIdx ? '✓' : i === stepIdx ? '●' : '○'}
                            </div>
                            <p style={{ fontSize: 10, color: i <= stepIdx ? '#c9a84c' : '#6b6b6b', textAlign: 'center', whiteSpace: 'nowrap' }}>{s}</p>
                          </div>
                          {i < STATUS_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < stepIdx ? '#c9a84c' : '#2a2a2a', minWidth: 20 }} />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {item.product?.images?.[0] && <img src={getMediaUrl(item.product.images[0])} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />}
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500 }}>{item.product?.title || 'Product'}</p>
                          <p style={{ color: '#6b6b6b', fontSize: 13 }}>Qty: {item.quantity} · ₹{item.price?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Courier Info */}
                  {order.courier?.trackingNumber && (
                    <div style={{ background: '#0a0a0a', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                      <p style={{ color: '#6b6b6b', fontSize: 12, marginBottom: 4 }}>TRACKING</p>
                      <p style={{ fontSize: 14 }}>{order.courier.company} — <span style={{ color: '#c9a84c' }}>{order.courier.trackingNumber}</span></p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {canCancel && (
                      <button onClick={() => setCancelModal(order._id)} className="btn-outline" style={{ padding: '8px 18px', fontSize: 13, borderColor: '#f44336', color: '#f44336' }}>
                        Cancel Order
                      </button>
                    )}
                    {canReplace && (
                      <button onClick={() => setReplaceModal(order._id)} className="btn-outline" style={{ padding: '8px 18px', fontSize: 13 }}>
                        🔄 Request Replacement
                      </button>
                    )}
                    <span style={{ padding: '8px 18px', fontSize: 13, borderRadius: 6, background: '#0a0a0a', color: '#6b6b6b' }}>
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
          <div style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: 16 }}>Cancel Order</h3>
            <textarea className="input-luxury" placeholder="Reason for cancellation (optional)" value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn-outline" onClick={() => setCancelModal(null)} style={{ flex: 1 }}>Back</button>
              <button onClick={() => cancelOrder(cancelModal)} style={{ flex: 1, padding: '12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Replacement Modal */}
      {replaceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
          <div style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: 16 }}>Request Replacement</h3>
            <p style={{ color: '#6b6b6b', fontSize: 14, marginBottom: 16 }}>Describe the issue with your product.</p>
            <textarea className="input-luxury" placeholder="Describe the damage or issue..." value={replaceReason} onChange={e => setReplaceReason(e.target.value)} rows={4} />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn-outline" onClick={() => setReplaceModal(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-gold" onClick={() => submitReplacement(replaceModal)} style={{ flex: 1 }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
