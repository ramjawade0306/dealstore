'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { name: 'Watches', emoji: '⌚', slug: 'watches' },
  { name: 'Shoes', emoji: '👟', slug: 'shoes' },
  { name: 'Perfumes', emoji: '🌹', slug: 'perfumes' },
  { name: 'Bags', emoji: '👜', slug: 'bags' },
  { name: 'Accessories', emoji: '💎', slug: 'accessories' },
];

const HERO_SLIDES = [
  { 
    headline: 'Luxury Watches', 
    sub: 'Premium timepieces at unbeatable prices', 
    image: '/hero_watch.png', 
    color: '#1a1200',
    tag: 'Timeless Elegance'
  },
  { 
    headline: 'Designer Shoes', 
    sub: 'Walk in style without breaking the bank', 
    image: '/hero_shoes.png', 
    color: '#0a1200',
    tag: 'Urban Sophistication'
  },
  { 
    headline: 'Exotic Perfumes', 
    sub: 'Rare fragrances, affordable luxury', 
    image: '/hero_perfume.png', 
    color: '#12000a',
    tag: 'Sensory Perfection'
  },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => {
        setProducts(data);
        setFeatured(data.filter(p => p.isFeatured).slice(0, 8));
        setDeals(data.filter(p => p.isLowPriceDeal).slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = activeCategory === 'All' ? products.slice(0, 16) : products.filter(p => p.category === activeCategory).slice(0, 16);

  return (
    <div style={{ paddingTop: 70 }}>
      {/* HERO SLIDER */}
      <section style={{
        minHeight: '92vh',
        background: `radial-gradient(circle at 50% 50%, ${HERO_SLIDES[slide].color} 0%, #050505 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Animated background elements */}
        <div style={{ position: 'absolute', width: '120%', height: '120%', background: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")', opacity: 0.05, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: HERO_SLIDES[slide].color, filter: 'blur(120px)', opacity: 0.3, top: '20%', left: '10%', transition: 'all 1.5s ease' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: '#c9a84c', filter: 'blur(100px)', opacity: 0.1, bottom: '10%', right: '15%', transition: 'all 1.5s ease' }} />

        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center', gap: 60, textAlign: 'left', zIndex: 10 }}>
          
          <div className="reveal" key={`content-${slide}`} style={{ opacity: 0 }}>
            <span style={{ 
              color: '#c9a84c', 
              letterSpacing: '0.3em', 
              fontSize: 12, 
              textTransform: 'uppercase', 
              marginBottom: 16, 
              display: 'block',
              fontWeight: 800,
              textShadow: '0 0 20px rgba(201,168,76,0.3)'
            }}>
              {HERO_SLIDES[slide].tag}
            </span>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(3.5rem, 6vw, 5.5rem)',
              fontWeight: 700,
              color: '#fff',
              marginBottom: 24,
              lineHeight: 1,
              fontStyle: 'italic'
            }}>
              {HERO_SLIDES[slide].headline.split(' ')[0]} <br/>
              <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {HERO_SLIDES[slide].headline.split(' ').slice(1).join(' ')}
              </span>
            </h1>
            <p style={{ color: '#f9f6ef', opacity: 0.6, fontSize: '1.15rem', marginBottom: 40, maxWidth: 480, lineHeight: 1.6 }}>
              {HERO_SLIDES[slide].sub}
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <Link href="/products" className="btn-gold pulse-gold" style={{ padding: '16px 40px', fontSize: 15 }}>Shop Collection</Link>
              <Link href="/deals" className="btn-outline" style={{ padding: '15px 38px', fontSize: 15, backdropFilter: 'blur(10px)' }}>Special Deals</Link>
            </div>
          </div>

          <div className="reveal floating" key={`img-${slide}`} style={{ opacity: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                position: 'absolute', inset: -20, borderRadius: '50%', 
                background: 'var(--gradient-gold)', opacity: 0.15, filter: 'blur(40px)',
                animation: 'pulse-gold 4s infinite' 
              }} />
              <img 
                src={HERO_SLIDES[slide].image} 
                alt={HERO_SLIDES[slide].headline}
                style={{ 
                  width: '100%', maxWidth: 500, height: 'auto', 
                  filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.8))',
                  position: 'relative', zIndex: 2
                }} 
              />
            </div>
          </div>

        </div>

        {/* Slide indicators */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, zIndex: 20 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              style={{ 
                width: i === slide ? 40 : 10, 
                height: 4, 
                borderRadius: 2, 
                background: i === slide ? '#c9a84c' : 'rgba(255,255,255,0.2)', 
                border: 'none', 
                cursor: 'pointer', 
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' 
              }} 
            />
          ))}
        </div>

        {/* Backdrop text for luxury feel */}
        <div style={{ 
          position: 'absolute', bottom: -20, right: -20, 
          fontSize: '12rem', fontWeight: 900, color: '#fff', opacity: 0.02, 
          fontFamily: 'Cormorant Garamond, serif', pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}>
          EST. 2024 LUXURY
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <p className="section-subtitle">Browse By</p>
          <h2 className="section-title">Categories</h2>
          <div className="divider-gold" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 12, padding: '28px 16px',
                  background: '#161616', border: '1px solid rgba(201,168,76,0.12)',
                  borderRadius: 16, textAlign: 'center', textDecoration: 'none',
                  transition: 'all 0.3s', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)'; e.currentTarget.style.transform = 'none'; }}
              >
                <span style={{ fontSize: 40 }}>{cat.emoji}</span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#f9f6ef' }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {(featured.length > 0 || loading) && (
        <section className="section" style={{ background: '#0d0d0d' }}>
          <div className="container">
            <p className="section-subtitle">Hand Picked</p>
            <h2 className="section-title">Featured Products</h2>
            <div className="divider-gold" />
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader-gold" /></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {featured.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* LOW PRICE DEALS BANNER */}
      <section style={{ background: 'linear-gradient(135deg, #1a1200 0%, #0a0a0a 50%, #12080a 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <div className="container">
          <p className="section-subtitle">Limited Time</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: '#f9f6ef', marginBottom: 16 }}>
            Low Price Luxury <span style={{ color: '#c9a84c' }}>Deals</span>
          </h2>
          <p style={{ color: '#6b6b6b', maxWidth: 500, margin: '0 auto 36px' }}>
            Exclusive deals on premium luxury items. Limited stock — grab yours before it's gone!
          </p>
          <Link href="/deals" className="btn-gold" style={{ fontSize: 16, padding: '14px 36px' }}>🔥 View All Deals</Link>
        </div>
      </section>

      {/* INSTAGRAM GRID */}
      <section className="section">
        <div className="container">
          <p className="section-subtitle">Instagram Style</p>
          <h2 className="section-title">All Products</h2>
          <div className="divider-gold" />

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
            {['All', ...CATEGORIES.map(c => c.name)].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 20px', borderRadius: 50, border: '1.5px solid',
                  borderColor: activeCategory === cat ? '#c9a84c' : 'rgba(201,168,76,0.2)',
                  background: activeCategory === cat ? '#c9a84c' : 'transparent',
                  color: activeCategory === cat ? '#0a0a0a' : '#f9f6ef',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.3s'
                }}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader-gold" /></div>
          ) : (
            <div className="insta-grid">
              {filteredProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/products" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
