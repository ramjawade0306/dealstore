'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { name: 'Watches', slug: 'watches', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=400&q=80' },
  { name: 'Shoes', slug: 'shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80' },
  { name: 'Perfumes', slug: 'perfumes', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80' },
  { name: 'Bags', slug: 'bags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80' },
  { name: 'Jewelry', slug: 'accessories', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80' },
];

const HERO_SLIDES = [
  /*
   - **Major Visual Overhaul**: Completely redesigned the landing page for a world-class luxury experience. Implement high-end typography (Cormorant Garamond), immersive full-height hero sections with animated assets, and a consistent dark-palette aesthetic with gold accents.
   - **Premium Navbar Branding**: Standardized all navigation icons to sharp, professional SVGs and implemented a sophisticated "Gold Gradient" effect for the brand logo.
   - **Luxury Product Interface**: Upgraded the product cards to a premium dark-mode styling with gold-filled action buttons and vector-based iconography.
  */
  { 
    headline: 'Timeless Precision', 
    sub: 'Experience the pinnacle of craftsmanship with our curated luxury timepiece collection.', 
    image: '/hero_luxury_watch.png', 
    accent: '#c9a84c',
    label: 'EXQUISITE WATCHES'
  },
  { 
    headline: 'Sensory Perfection', 
    sub: 'Discover rare fragrances that define elegance and leave a lasting impression.', 
    image: '/hero_luxury_perfume.png', 
    accent: '#e8c97a',
    label: 'ELITE PERFUMES'
  },
  { 
    headline: 'Urban Sophistication', 
    sub: 'Walk with confidence in designer footwear crafted for style and enduring comfort.', 
    image: '/hero_shoes.png', 
    accent: '#f9f6ef',
    label: 'DESIGNER FOOTWEAR'
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
    const timer = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = activeCategory === 'All' ? products.slice(0, 16) : products.filter(p => p.category === activeCategory).slice(0, 16);

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#f9f6ef' }}>
      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        background: '#050505'
      }}>
        {/* Background Hero Image */}
        <div className="hero-bg-image fade-in" key={`bg-img-${slide}`} style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${HERO_SLIDES[slide].image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.08,
          zIndex: 1,
          transition: 'all 1.5s ease'
        }} />

        {/* Background Glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 70% 50%, ${HERO_SLIDES[slide].accent}22 0%, transparent 60%)`,
          transition: 'all 1.5s ease',
          zIndex: 2
        }} />

        <div className="container hero-container" style={{
          position: 'relative',
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          alignItems: 'center',
          gap: 40
        }}>
          {/* Content */}
          <div className="hero-content" style={{ textAlign: 'left' }}>
            <span className="fade-in" key={`label-${slide}`} style={{
              display: 'inline-block',
              padding: '4px 12px',
              border: `1px solid ${HERO_SLIDES[slide].accent}`,
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 4,
              color: HERO_SLIDES[slide].accent,
              marginBottom: 20,
              textTransform: 'uppercase'
            }}>
              {HERO_SLIDES[slide].label}
            </span>
            <h1 className="fade-in" key={`title-${slide}`} style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(3rem, 10vw, 6rem)',
              lineHeight: 0.9,
              fontWeight: 700,
              marginBottom: 30,
              fontStyle: 'italic'
            }}>
              {HERO_SLIDES[slide].headline.split(' ').slice(0, -1).join(' ')} <br/>
              <span className="gold-text" style={{ fontSize: '1.2em' }}>
                {HERO_SLIDES[slide].headline.split(' ').slice(-1)}
              </span>
            </h1>
            <p className="fade-in" key={`sub-${slide}`} style={{
              fontSize: '1.2rem',
              opacity: 0.7,
              maxWidth: 500,
              marginBottom: 40,
              lineHeight: 1.6,
              fontWeight: 300
            }}>
              {HERO_SLIDES[slide].sub}
            </p>
            <div className="hero-btns" style={{ display: 'flex', gap: 20 }}>
              <Link href="/products" className="btn-gold-filled hero-btn" style={{ padding: '16px 40px', fontWeight: 700 }}>EXPLORE NOW</Link>
              <Link href="/deals" className="btn-outline-white hero-btn" style={{ padding: '15px 38px', fontWeight: 600 }}>VIEW DEALS</Link>
            </div>
          </div>

          {/* Foreground Image - HIDDEN ON MOBILE via CSS below */}
          <div className="fade-in img-float hero-fg-image" key={`img-${slide}`} style={{
            display: 'flex',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              background: `radial-gradient(circle, ${HERO_SLIDES[slide].accent}11 0%, transparent 70%)`,
              filter: 'blur(50px)',
              zIndex: -1
            }} />
            <img 
              src={HERO_SLIDES[slide].image} 
              alt="Luxury Product"
              style={{
                width: '100%',
                maxWidth: 600,
                maxHeight: '70vh',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.9))'
              }}
            />
          </div>
        </div>

        {/* Slide Controls */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          display: 'flex',
          gap: 15,
          zIndex: 20
        }}>
          {HERO_SLIDES.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? 50 : 12,
                height: 3,
                background: i === slide ? '#c9a84c' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.5s ease'
              }}
            />
          ))}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section style={{ padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', marginBottom: 10 }}>Curated Collections</h2>
            <div style={{ width: 60, height: 2, background: '#c9a84c', margin: '0 auto' }} />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24
          }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} style={{ textDecoration: 'none' }}>
                <div className="cat-card" style={{
                  position: 'relative',
                  height: 300,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img src={cat.image} alt={cat.name} style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.4,
                    transition: 'all 0.6s'
                  }} className="cat-img" />
                  <div style={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center'
                  }}>
                    <h3 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '1.8rem',
                      color: '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: 2
                    }}>{cat.name}</h3>
                    <span style={{ fontSize: 11, color: '#c9a84c', letterSpacing: 3 }}>SHOP NOW</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ padding: '100px 0', background: '#070707' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 50 }}>
            <div>
              <p style={{ color: '#c9a84c', fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>OUR FINEST</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem' }}>Featured Arrivals</h2>
            </div>
            <Link href="/products" style={{ color: '#f9f6ef', textDecoration: 'none', borderBottom: '1px solid #c9a84c', pb: 4, fontSize: 14 }}>View All</Link>
          </div>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="loader-gold" /></div>
          ) : (
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 30 }}>
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section style={{
        padding: '120px 0',
        background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1547996160-81dfa63595dd?auto=format&fit=crop&w=1500&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '4rem', color: '#fff', marginBottom: 20 }}>Elevate Your Lifestyle</h2>
          <p style={{ maxWidth: 600, margin: '0 auto 40px', fontSize: '1.2rem', opacity: 0.8 }}>
            Indulge in premium quality products at prices that fit your ambition. Exclusive deals refreshed daily.
          </p>
          <Link href="/deals" className="btn-gold-filled" style={{ padding: '18px 50px', fontSize: 16 }}>BROWSE DEALS</Link>
        </div>
      </section>

      {/* ALL PRODUCTS GRID */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
             <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem' }}>The Collection</h2>
             <div style={{ display: 'flex', gap: 15, justifyContent: 'center', flexWrap: 'wrap', marginTop: 30 }}>
                {['All', ...CATEGORIES.map(c => c.name)].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '8px 24px',
                      background: activeCategory === cat ? '#c9a84c' : 'transparent',
                      color: activeCategory === cat ? '#000' : '#f9f6ef',
                      border: `1px solid ${activeCategory === cat ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 30,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      transition: 'all 0.3s'
                    }}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>

          {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="loader-gold" /></div>
          ) : (
             <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 30 }}>
               {filteredProducts.map(p => <ProductCard key={p._id} product={p} />)}
             </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .gold-text {
          background: linear-gradient(135deg, #c9a84c 0%, #f9f6ef 50%, #e8c97a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .btn-gold-filled {
          background: #c9a84c;
          color: #000;
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.3s;
        }
        .btn-gold-filled:hover {
          background: #f9f6ef;
          transform: translateY(-2px);
        }
        .btn-outline-white {
          border: 1px solid #c9a84c;
          color: #c9a84c;
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.3s;
        }
        .btn-outline-white:hover {
          background: rgba(201,168,76,0.1);
        }
        .cat-card:hover .cat-img {
          transform: scale(1.1);
          opacity: 0.6 !important;
        }
        .fade-in {
          animation: fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .img-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @media (max-width: 768px) {
          section { height: auto !important; padding: 100px 0 !important; }
          .hero-container { grid-template-columns: 1fr !important; gap: 20px !important; }
          .hero-content { text-align: center !important; display: flex; flex-direction: column; align-items: center; }
          .hero-btns { flex-direction: column; width: 100%; max-width: 280px; gap: 12px !important; }
          .hero-btn { padding: 12px 20px !important; font-size: 14px !important; text-align: center; }
          .hero-fg-image { display: none !important; }
          h1 { font-size: 3.5rem !important; }
          .product-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; }
          .container { padding: 0 12px !important; }
        }
      `}</style>
    </div>
  );
}
