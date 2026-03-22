'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';

function ProductsList() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    api.get('/products').then(({ data }) => { setProducts(data); setFiltered(data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = products;
    if (q) result = result.filter(p => p.title.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()));
    if (category !== 'All') result = result.filter(p => p.category === category);
    setFiltered(result);
  }, [q, category, products]);

  const CATS = ['All', 'Watches', 'Shoes', 'Perfumes', 'Bags', 'Accessories'];

  return (
    <div style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container">
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', marginBottom: 8 }}>
          {q ? `Results for "${q}"` : 'All Products'}
        </h1>
        <p style={{ color: '#6b6b6b', marginBottom: 32 }}>{filtered.length} products</p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ padding: '8px 20px', borderRadius: 50, border: '1.5px solid', borderColor: category === cat ? '#c9a84c' : 'rgba(201,168,76,0.2)', background: category === cat ? '#c9a84c' : 'transparent', color: category === cat ? '#0a0a0a' : '#f9f6ef', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.3s' }}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader-gold" /></div> : (
          filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
              <p style={{ color: '#6b6b6b', fontSize: 18 }}>No products found</p>
            </div>
          ) : (
            <div className="insta-grid">{filtered.map(p => <ProductCard key={p._id} product={p} />)}</div>
          )
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: 120, textAlign: 'center' }}><div className="loader-gold" /></div>}>
      <ProductsList />
    </Suspense>
  );
}
