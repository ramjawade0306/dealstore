'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';

const CAT_META = {
  watches: { label: 'Luxury Watches', emoji: '⌚', desc: 'Premium timepieces from top brands at amazing prices.' },
  shoes: { label: 'Designer Shoes', emoji: '👟', desc: 'Step into luxury with our exclusive shoe collection.' },
  perfumes: { label: 'Exotic Perfumes', emoji: '🌹', desc: 'Rare fragrances and luxury scents for every occasion.' },
  bags: { label: 'Designer Bags', emoji: '👜', desc: 'Carry style with our premium bag collection.' },
  accessories: { label: 'Luxury Accessories', emoji: '💎', desc: 'Elevate every outfit with premium accessories.' },
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const meta = CAT_META[slug] || { label: slug, emoji: '🏷️', desc: '' };

  useEffect(() => {
    const cat = slug.charAt(0).toUpperCase() + slug.slice(1);
    api.get(`/products`).then(({ data }) => setProducts(data.filter(p => p.category === cat))).finally(() => setLoading(false));
  }, [slug]);

  return (
    <div style={{ paddingTop: 70 }}>
      <div style={{ background: 'radial-gradient(ellipse at center, #1a1200 0%, #0a0a0a 60%)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{meta.emoji}</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{meta.label}</h1>
        <p style={{ color: '#6b6b6b', marginTop: 12, maxWidth: 400, margin: '12px auto 0' }}>{meta.desc}</p>
      </div>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader-gold" /></div> : (
          products.length === 0 ? <p style={{ color: '#6b6b6b', textAlign: 'center', padding: '60px 0' }}>No products in this category yet.</p> :
          <div className="insta-grid">{products.map(p => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </div>
    </div>
  );
}
