'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const TABS = ['Dashboard', 'Orders', 'Products', 'Settings', 'Customers'];
const STATUS_OPTIONS = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

import { getMediaUrl } from '@/lib/utils';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({ codEnabled: true, deliveryCharge: 0, categories: ['Watches', 'Shoes', 'Perfumes', 'Bags', 'Accessories'] });
  const [replacements, setReplacements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCustomerForOrders, setSelectedCustomerForOrders] = useState(null);
  const [orderUpdateForm, setOrderUpdateForm] = useState({ orderStatus: '', courierCompany: '', trackingNumber: '' });
  const [newProduct, setNewProduct] = useState({ title: '', brand: '', originalPrice: '', discountPrice: '', description: '', category: 'Watches', images: [], sizes: [], stock: '', isFeatured: false, isLowPriceDeal: false });
  const [exportLoading, setExportLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [exportDates, setExportDates] = useState({ startDate: '', endDate: '' });
  const [newCategory, setNewCategory] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/upload', formData);
      setNewProduct(prev => ({ ...prev, images: [...prev.images, data.url] }));
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    loadTab('Dashboard');
  }, [user]);

  const loadTab = async (t) => {
    setTab(t); setLoading(true);
    try {
      if (t === 'Dashboard') {
        const [s, r, o, cfg] = await Promise.all([api.get('/orders/admin/stats'), api.get('/replacements/admin'), api.get('/orders/admin/all'), api.get('/admin/settings')]);
        setStats(s.data); setReplacements(r.data); setOrders(o.data.slice(0, 5)); setSettings(cfg.data);
      } else if (t === 'Orders') {
        const { data } = await api.get('/orders/admin/all');
        setOrders(data);
      } else if (t === 'Products') {
        const [{ data: prods }, { data: cfg }] = await Promise.all([api.get('/products'), api.get('/admin/settings')]);
        setProducts(prods); setSettings(cfg);
      } else if (t === 'Customers') {
        const { data } = await api.get('/users');
        setCustomers(data);
      } else if (t === 'Settings') {
        const { data } = await api.get('/admin/settings');
        setSettings(data);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, orderUpdateForm);
      toast.success('Order updated!');
      setSelectedOrder(null);
      loadTab('Orders');
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const createProduct = async () => {
    try {
      const payload = { ...newProduct, originalPrice: Number(newProduct.originalPrice), discountPrice: Number(newProduct.discountPrice), stock: Number(newProduct.stock) };
      await api.post('/products', payload);
      toast.success('Product created!');
      setNewProduct({ title: '', brand: '', originalPrice: '', discountPrice: '', description: '', category: 'Watches', images: [], sizes: [], stock: '', isFeatured: false, isLowPriceDeal: false });
      loadTab('Products');
    } catch (err) {
      toast.error('Failed to create product');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadTab('Products');
    } catch { toast.error('Failed to delete'); }
  };

  const saveSettings = async () => {
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
  };

  const handleApproveReplacement = async (id, status) => {
    try {
      await api.put(`/replacements/admin/${id}`, { status });
      toast.success(`Replacement ${status.toLowerCase()}`);
      loadTab('Dashboard');
    } catch { toast.error('Failed to update'); }
  };

  const exportOrders = async () => {
    setExportLoading(true);
    try {
      let query = '';
      if(exportDates.startDate && exportDates.endDate) query = `?startDate=${exportDates.startDate}&endDate=${exportDates.endDate}`;
      const res = await api.get(`/admin/export${query}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'orders.xlsx'; a.click();
      toast.success('Export downloaded!');
    } catch { toast.error('Export failed'); }
    setExportLoading(false);
  };

  const statCards = stats ? [
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: '#c9a84c' },
    { label: 'Pending', value: stats.pendingOrders, icon: '⏳', color: '#FF9800' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: '✅', color: '#4CAF50' },
    { label: 'Cancelled', value: stats.cancelledOrders, icon: '❌', color: '#f44336' },
    { label: 'Orders Today', value: stats.ordersToday, icon: '📅', color: '#2196F3' },
    { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: '#9C27B0' },
  ] : [];

  const boxStyle = { background: '#161616', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: 20 };

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: '#0a0a0a' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '20px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#c9a84c' }}>Admin Dashboard</h1>
              <p style={{ color: '#6b6b6b', fontSize: 14 }}>Low Price Luxury · Manage your store</p>
            </div>
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', padding: '6px 14px', borderRadius: 8, fontSize: 11, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              🔄 Refresh Session
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: '#161616', borderRadius: 12, padding: 4, flexWrap: 'wrap', border: '1px solid rgba(201,168,76,0.12)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => loadTab(t)}
              style={{ flex: 1, minWidth: 80, padding: '10px 16px', borderRadius: 8, border: 'none', background: tab === t ? 'linear-gradient(135deg, #c9a84c, #e8c97a)' : 'transparent', color: tab === t ? '#0a0a0a' : '#6b6b6b', fontWeight: tab === t ? 700 : 400, fontSize: 14, cursor: 'pointer', transition: 'all 0.3s' }}>
              {t}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 60 }}><div className="loader-gold" /></div>}

        {/* DASHBOARD */}
        {tab === 'Dashboard' && !loading && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              {statCards.map(card => (
                <div key={card.label} onClick={() => loadTab('Orders')} style={{ ...boxStyle, textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{card.icon}</div>
                  <p style={{ color: card.color, fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Cormorant Garamond, serif' }}>{card.value}</p>
                  <p style={{ color: '#6b6b6b', fontSize: 13 }}>{card.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div style={{ ...boxStyle, marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#c9a84c', marginBottom: 16 }}>Recent Orders</h2>
              {orders.length === 0 ? <p style={{ color: '#6b6b6b' }}>No recent orders</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                        {['Product', 'Order ID', 'Customer', 'Address', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                          <th key={h} style={{ padding: '8px', textAlign: 'left', color: '#6b6b6b', fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {o.items?.[0]?.product?.images?.[0] ? (
                                <img src={getMediaUrl(o.items[0].product.images[0])} alt="Product" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />
                              ) : <span>📦</span>}
                              <div style={{ fontSize: 11, color: '#f9f6ef', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {o.items?.[0]?.product?.title}
                                {o.items?.length > 1 && <span style={{ color: '#c9a84c' }}> +{o.items.length - 1} more</span>}
                              </div>
                            </div>
                          </td>
                          <td onClick={() => { setSelectedOrder(o); setOrderUpdateForm({ orderStatus: o.orderStatus, courierCompany: o.courier?.company || '', trackingNumber: o.courier?.trackingNumber || '' }); }}
                            style={{ padding: '8px', color: '#c9a84c', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
                            #{o._id.slice(-8).toUpperCase()}
                          </td>
                          <td style={{ padding: '8px' }}>{o.user?.name || o.user?.phoneNumber}</td>
                          <td style={{ padding: '8px', fontSize: 12, color: '#f9f6ef' }}>
                            {o.shippingAddress ? `${o.shippingAddress.street}, ${o.shippingAddress.city}` : 'N/A'}
                          </td>
                          <td style={{ padding: '8px', fontWeight: 600 }}>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '8px' }}>{o.orderStatus}</td>
                          <td style={{ padding: '8px', color: '#6b6b6b', fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '8px' }}>
                            <button onClick={() => { setSelectedOrder(o); setOrderUpdateForm({ orderStatus: o.orderStatus, courierCompany: o.courier?.company || '', trackingNumber: o.courier?.trackingNumber || '' }); }}
                              className="badge-gold" style={{ cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 }}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Replacement Requests */}
            <div style={boxStyle}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#c9a84c', marginBottom: 16 }}>Replacement Requests</h2>
              {replacements.length === 0 ? <p style={{ color: '#6b6b6b' }}>No replacement requests</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {replacements.map(r => (
                    <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, padding: '16px', background: '#0a0a0a', borderRadius: 10, border: '1px solid rgba(201,168,76,0.08)' }}>
                      <div style={{ flex: 1, minWidth: 260 }}>
                        {/* Customer & Reason */}
                        <p style={{ fontWeight: 600, marginBottom: 2 }}>{r.user?.name || 'Customer'}</p>
                        <p style={{ color: '#c9a84c', fontSize: 12, marginBottom: 4 }}>📱 {r.user?.phoneNumber}</p>
                        <p style={{ color: '#f9f6ef', fontSize: 13, marginBottom: 4 }}>📝 {r.reason}</p>
                        <p style={{ color: '#6b6b6b', fontSize: 12, marginBottom: 12 }}>📅 {new Date(r.createdAt).toLocaleDateString()}</p>

                        {/* Product Details from Order */}
                        {r.order?.items?.length > 0 && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                            <p style={{ color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Products in Order</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {r.order.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                  {item.product?.images?.[0] && (
                                    <img src={getMediaUrl(item.product.images[0])} alt={item.product.title} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid rgba(201,168,76,0.2)' }} />
                                  )}
                                  <div>
                                    <p style={{ fontSize: 13, fontWeight: 500 }}>{item.product?.title || 'Unknown Product'}</p>
                                    <p style={{ color: '#6b6b6b', fontSize: 12 }}>{item.product?.brand} · Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ''}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {r.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button onClick={() => handleApproveReplacement(r._id, 'Approved')} style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Approve</button>
                          <button onClick={() => handleApproveReplacement(r._id, 'Rejected')} style={{ background: '#f44336', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Reject</button>
                        </div>
                      ) : <span style={{ color: r.status === 'Approved' ? '#4CAF50' : '#f44336', fontWeight: 700, fontSize: 13, padding: '6px 14px', background: r.status === 'Approved' ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)', borderRadius: 6 }}>{r.status}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ORDERS */}
        {tab === 'Orders' && !loading && (
          <div style={boxStyle}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#c9a84c', marginBottom: 20 }}>All Orders ({orders.length})</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                    {['Product', 'Order ID', 'Customer', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 8px', textAlign: 'left', color: '#6b6b6b', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {o.items?.[0]?.product?.images?.[0] ? (
                            <img src={getMediaUrl(o.items[0].product.images[0])} alt="Product" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid rgba(201,168,76,0.15)' }} />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 6, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>📦</div>
                          )}
                          <div style={{ fontSize: 12, lineHeight: 1.3 }}>
                            <div style={{ fontWeight: 600, color: '#f9f6ef' }}>{o.items?.[0]?.product?.title}</div>
                            {o.items?.length > 1 && (
                              <div style={{ color: '#c9a84c', fontSize: 11, marginTop: 2, fontWeight: 500 }}>
                                + {o.items.length - 1} other items
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td onClick={() => { setSelectedOrder(o); setOrderUpdateForm({ orderStatus: o.orderStatus, courierCompany: o.courier?.company || '', trackingNumber: o.courier?.trackingNumber || '' }); }}
                        style={{ padding: '12px 8px', color: '#c9a84c', fontFamily: 'monospace', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
                        #{o._id.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 500 }}>{o.user?.name || 'Customer'}</div>
                        <div style={{ fontSize: 11, color: '#6b6b6b' }}>{o.user?.phoneNumber}</div>
                      </td>
                      <td style={{ padding: '12px 8px', color: '#e8c97a', fontWeight: 600 }}>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 8px', color: '#6b6b6b' }}>{o.paymentMethod}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 50, fontSize: 12, background: '#0a0a0a', color: o.orderStatus === 'Delivered' ? '#4CAF50' : o.orderStatus === 'Cancelled' ? '#f44336' : '#c9a84c' }}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: '#6b6b6b', fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <button onClick={() => { setSelectedOrder(o); setOrderUpdateForm({ orderStatus: o.orderStatus, courierCompany: o.courier?.company || '', trackingNumber: o.courier?.trackingNumber || '' }); }}
                          className="badge-gold" style={{ cursor: 'pointer', border: 'none' }}>Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'Products' && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Add Product */}
            <div style={boxStyle}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#c9a84c', marginBottom: 20 }}>Add New Product</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {[['title', 'Title', 'text'], ['brand', 'Brand', 'text'], ['originalPrice', 'Original Price (₹)', 'number'], ['discountPrice', 'Discount Price (₹)', 'number'], ['stock', 'Stock', 'number']].map(([name, label, type]) => (
                  <div key={name}>
                    <label style={{ color: '#6b6b6b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{label}</label>
                    <input type={type} className="input-luxury" value={newProduct[name]} onChange={e => setNewProduct({ ...newProduct, [name]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label style={{ color: '#6b6b6b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Category</label>
                  <select className="input-luxury" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                    {(settings.categories?.length > 0 ? settings.categories : ['Watches', 'Shoes', 'Perfumes', 'Bags', 'Accessories']).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ color: '#6b6b6b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Product Images</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  {newProduct.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.2)' }}>
                      <img src={img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ✕
                      </button>
                    </div>
                  ))}
                  <label style={{ width: 80, height: 80, borderRadius: 8, border: '1px dashed rgba(201,168,76,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploadingImage ? 'not-allowed' : 'pointer', background: 'rgba(201,168,76,0.05)', color: '#c9a84c', fontSize: 24, transition: 'all 0.3s' }}>
                    {uploadingImage ? <div className="loader-gold" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '+'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                  </label>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ color: '#6b6b6b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea className="input-luxury" rows={3} value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b6b6b', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newProduct.isFeatured} onChange={e => setNewProduct({ ...newProduct, isFeatured: e.target.checked })} />
                  Featured Product
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b6b6b', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newProduct.isLowPriceDeal} onChange={e => setNewProduct({ ...newProduct, isLowPriceDeal: e.target.checked })} />
                  Low Price Deal
                </label>
              </div>
              <button className="btn-gold" style={{ marginTop: 20, padding: '12px 28px' }} onClick={createProduct}>+ Add Product</button>
            </div>

            {/* Product List */}
            <div style={boxStyle}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#c9a84c', marginBottom: 20 }}>Products ({products.length})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {products.map(p => (
                  <div key={p._id} style={{ background: '#0a0a0a', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, overflow: 'hidden' }}>
                    {p.images?.[0] && <img src={getMediaUrl(p.images[0])} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                    <div style={{ padding: 14 }}>
                      <p style={{ color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.brand}</p>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{p.title}</p>
                      <p style={{ color: '#e8c97a', fontWeight: 700 }}>₹{p.discountPrice?.toLocaleString('en-IN')}</p>
                      <p style={{ color: '#6b6b6b', fontSize: 12, marginBottom: 12 }}>Stock: {p.stock}</p>
                      <button onClick={() => deleteProduct(p._id)} style={{ background: '#f44336', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, width: '100%' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'Settings' && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={boxStyle}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#c9a84c', marginBottom: 24 }}>Orders Export</h2>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#6b6b6b' }}>From Date</label>
                  <input type="date" className="input-luxury" value={exportDates.startDate} onChange={e => setExportDates({ ...exportDates, startDate: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#6b6b6b' }}>To Date</label>
                  <input type="date" className="input-luxury" value={exportDates.endDate} onChange={e => setExportDates({ ...exportDates, endDate: e.target.value })} />
                </div>
                <button onClick={exportOrders} className="btn-gold" disabled={exportLoading} style={{ padding: '12px 24px', height: 46 }}>
                  {exportLoading ? 'Exporting...' : '📊 Export to Excel'}
                </button>
              </div>
            </div>

            <div style={boxStyle}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#c9a84c', marginBottom: 20 }}>Categories Management</h2>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <input className="input-luxury" placeholder="New category name..." value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                <button className="btn-gold" style={{ padding: '0 24px', whiteSpace: 'nowrap' }} onClick={() => {
                  if(!newCategory) return;
                  setSettings(s => ({ ...s, categories: [...(s.categories || []), newCategory] }));
                  setNewCategory('');
                }}>+ Add</button>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {(settings.categories || ['Watches']).map(cat => (
                  <div key={cat} style={{ background: '#0a0a0a', border: '1px solid rgba(201,168,76,0.2)', padding: '6px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13 }}>{cat}</span>
                    <button style={{ border: 'none', background: 'transparent', color: '#f44336', cursor: 'pointer', fontSize: 14 }} onClick={() => setSettings(s => ({ ...s, categories: s.categories.filter(c => c !== cat) }))}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={boxStyle}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#c9a84c', marginBottom: 24 }}>Payment Settings</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24, background: '#0a0a0a', borderRadius: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>Cash on Delivery (COD)</p>
                  <p style={{ color: '#6b6b6b', fontSize: 14 }}>Toggle COD payment option for customers</p>
                </div>
                <button onClick={async () => {
                  const newVal = !settings.codEnabled;
                  const newSettings = { ...settings, codEnabled: newVal };
                  setSettings(newSettings);
                  try {
                    await api.put('/admin/settings', newSettings);
                    toast.success(`COD ${newVal ? 'Enabled' : 'Disabled'}`);
                  } catch (err) {
                    toast.error('Failed to update COD');
                    setSettings(settings); // Revert on failure
                  }
                }}
                  style={{ width: 56, height: 28, borderRadius: 14, border: 'none', background: settings.codEnabled ? '#4CAF50' : '#2a2a2a', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
                  <div style={{ position: 'absolute', top: 3, left: settings.codEnabled ? 30 : 4, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left 0.3s' }} />
                </button>
                <span style={{ color: settings.codEnabled ? '#4CAF50' : '#f44336', fontWeight: 600 }}>{settings.codEnabled ? 'ON' : 'OFF'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24, background: '#0a0a0a', borderRadius: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>Delivery Charge (₹)</p>
                  <p style={{ color: '#6b6b6b', fontSize: 14 }}>Apply fixed delivery charge on all orders</p>
                </div>
                <input type="number" className="input-luxury" style={{ maxWidth: 120 }} value={settings.deliveryCharge || 0} onChange={e => setSettings({ ...settings, deliveryCharge: Number(e.target.value) })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24, background: '#0a0a0a', borderRadius: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>WhatsApp Support Number</p>
                  <p style={{ color: '#6b6b6b', fontSize: 14 }}>Include country code (e.g. +91XXXXXXXXXX)</p>
                </div>
                <input type="text" className="input-luxury" style={{ maxWidth: 220 }} value={settings.supportWhatsapp || ''} onChange={e => setSettings({ ...settings, supportWhatsapp: e.target.value })} />
              </div>
              <button className="btn-gold" onClick={saveSettings} style={{ padding: '12px 28px' }}>Save All Settings</button>
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {tab === 'Customers' && !loading && (
          <div style={boxStyle}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#c9a84c', marginBottom: 20 }}>Customers ({customers.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {customers.map(c => (
                <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#0a0a0a', borderRadius: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p onClick={() => setSelectedCustomerForOrders(c)} style={{ fontWeight: 600, cursor: 'pointer', color: '#e8c97a', textDecoration: 'underline' }}>{c.name || 'Customer'}</p>
                    <p style={{ color: '#c9a84c', fontSize: 13, marginTop: 4 }}>{c.phoneNumber}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b6b6b' }}>
                    <span>Orders: {c.orderHistory?.length || 0}</span>
                    <span>Joined: {new Date(c.createdAt).toLocaleDateString()}</span>
                    {c.role === 'admin' && <span className="badge-gold">Admin</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Update Modal */}
        {selectedOrder && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
            <div style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 16, padding: 0, maxWidth: 800, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* Modal Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(201,168,76,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1c1c1c' }}>
                <div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#c9a84c' }}>
                    Order Details #{selectedOrder._id.slice(-8).toUpperCase()}
                  </h3>
                  <p style={{ color: '#6b6b6b', fontSize: 13 }}>Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>&times;</button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: 32, overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>
                
                {/* Left Side: Products & Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  
                  {/* Products */}
                  <div>
                    <h4 style={{ fontSize: 12, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Items in Order</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 12, background: '#0a0a0a', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                          <img src={getMediaUrl(item.product?.images?.[0])} alt={item.product?.title} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: 14 }}>{item.product?.title || 'Unknown Product'}</p>
                            <p style={{ color: '#6b6b6b', fontSize: 12 }}>{item.product?.brand} · Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ''}</p>
                          </div>
                          <div style={{ textAlign: 'right', fontWeight: 600, color: '#e8c97a' }}>
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 16, textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                      <span style={{ color: '#6b6b6b', fontSize: 14 }}>Total Amount: </span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c9a84c' }}>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div style={{ background: '#0a0a0a', padding: 20, borderRadius: 12, border: '1px solid rgba(201,168,76,0.1)' }}>
                    <h4 style={{ fontSize: 12, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Delivery Address</h4>
                    <div style={{ fontSize: 14, color: '#f9f6ef', lineHeight: 1.6 }}>
                      <p style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{selectedOrder.user?.name || 'Customer'}</p>
                      <p>📞 {selectedOrder.user?.phoneNumber}</p>
                      {selectedOrder.shippingAddress && (
                        <>
                          <p>{selectedOrder.shippingAddress.street}</p>
                          <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Update Status */}
                <div>
                  <h4 style={{ fontSize: 12, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Manage Order</h4>
                  <div style={{ background: '#0a0a0a', padding: 20, borderRadius: 12, border: '1px solid rgba(201,168,76,0.1)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {selectedOrder.orderStatus === 'Cancelled' ? (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>🚫</div>
                        <p style={{ color: '#f44336', fontSize: 14, fontWeight: 600 }}>Order Cancelled</p>
                        <p style={{ color: '#6b6b6b', fontSize: 12, marginTop: 4 }}>This order cannot be updated.</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label style={{ color: '#6b6b6b', fontSize: 11, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Update Status</label>
                          <select className="input-luxury" value={orderUpdateForm.orderStatus} onChange={e => setOrderUpdateForm({ ...orderUpdateForm, orderStatus: e.target.value })}>
                            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ color: '#6b6b6b', fontSize: 11, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Courier Partner</label>
                          <input className="input-luxury" placeholder="e.g. BlueDart" value={orderUpdateForm.courierCompany} onChange={e => setOrderUpdateForm({ ...orderUpdateForm, courierCompany: e.target.value })} />
                        </div>
                        <div>
                          <label style={{ color: '#6b6b6b', fontSize: 11, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Tracking ID</label>
                          <input className="input-luxury" placeholder="Enter number" value={orderUpdateForm.trackingNumber} onChange={e => setOrderUpdateForm({ ...orderUpdateForm, trackingNumber: e.target.value })} />
                        </div>
                        <button className="btn-gold" onClick={() => updateOrderStatus(selectedOrder._id)} style={{ padding: 14, marginTop: 8 }}>
                          Save & Update status
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div style={{ padding: '16px 32px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'right', background: '#1c1c1c' }}>
                <button className="btn-outline" onClick={() => setSelectedOrder(null)} style={{ padding: '8px 24px' }}>Close View</button>
              </div>

            </div>
          </div>
        )}

        {/* Customer Orders Modal */}
        {selectedCustomerForOrders && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
            <div style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 16, padding: 32, maxWidth: 640, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                  Orders by {selectedCustomerForOrders.name || selectedCustomerForOrders.phoneNumber}
                </h3>
                <button onClick={() => setSelectedCustomerForOrders(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer' }}>&times;</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, paddingRight: 8 }}>
                {(!selectedCustomerForOrders.orderHistory || selectedCustomerForOrders.orderHistory.length === 0) ? (
                  <p style={{ color: '#6b6b6b' }}>This customer hasn't placed any orders yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {selectedCustomerForOrders.orderHistory.map(o => (
                      <div key={o._id} style={{ background: '#0a0a0a', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div>
                            <p style={{ color: '#c9a84c', fontSize: 12, fontFamily: 'monospace' }}>#{o._id.slice(-8).toUpperCase()}</p>
                            <p style={{ color: '#6b6b6b', fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 12, background: '#2a2a2a', padding: '4px 10px', borderRadius: 4 }}>{o.orderStatus}</span>
                            <p style={{ fontWeight: 600, marginTop: 6 }}>₹{o.totalAmount?.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {o.items?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <img src={getMediaUrl(item.product?.images?.[0])} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                              <div>
                                <p style={{ fontSize: 13 }}>{item.product?.title || 'Unknown Product'}</p>
                                <p style={{ color: '#6b6b6b', fontSize: 12 }}>Qty: {item.quantity} · Size: {item.size || 'N/A'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
