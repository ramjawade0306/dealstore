'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products').then(({ data }) => setDeals(data.filter(p => p.isLowPriceDeal))).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingTop: 70 }}>
      <div style={{ background: 'linear-gradient(135deg, #1a0800 0%, #0a0a0a 60%)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔥</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#f9f6ef' }}>
          Low Price Luxury <span style={{ color: '#c9a84c' }}>Deals</span>
        </h1>
        <p style={{ color: '#6b6b6b', marginTop: 12 }}>Exclusive deals on premium products — limited stock!</p>
      </div>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader-gold" /></div> : (
          deals.length === 0 ? <p style={{ color: '#6b6b6b', textAlign: 'center', padding: '60px 0' }}>No deals available right now. Check back soon!</p> :
          <div className="insta-grid">{deals.map(p => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </div>
    </div>
  );
}
