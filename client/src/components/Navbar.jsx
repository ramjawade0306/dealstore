'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const isAdminPortal = pathname?.startsWith('/admin');
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const categories = ['Watches', 'Shoes', 'Perfumes', 'Bags', 'Accessories'];

  return (
    <>
      <nav suppressHydrationWarning style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(10,10,10,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.15)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.png" alt="Logo" style={{ height: 44, width: 44, marginRight: 12, objectFit: 'cover', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.2)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span className="logo-text" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
                LOW PRICE
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.55rem', letterSpacing: '0.25em', color: '#c9a84c', textTransform: 'uppercase' }}>
                LUXURY
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="desktop-links hide-tablet" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <Link href="/products" className="nav-link" style={{ fontSize: 13, letterSpacing: '0.05em', color: '#c9a84c', fontWeight: 600, textTransform: 'uppercase' }}>
              All Products
            </Link>
            {categories.map(cat => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`}
                className="nav-link"
                style={{ fontSize: 13, letterSpacing: '0.05em', color: '#f9f6ef', opacity: 0.8, transition: 'all 0.3s', textTransform: 'uppercase' }}
                onMouseEnter={e => { e.target.style.color = '#c9a84c'; e.target.style.opacity = 1; }}
                onMouseLeave={e => { e.target.style.color = '#f9f6ef'; e.target.style.opacity = 0.8; }}
              >{cat}</Link>
            ))}
            <Link href="/deals" className="nav-link" style={{ fontSize: 13, letterSpacing: '0.05em', color: '#c9a84c', fontWeight: 600, textTransform: 'uppercase' }}>
              🔥 Deals
            </Link>
          </div>

          {/* Actions */}
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button
              onClick={() => setSearchOpen(!searchOpen)} 
              title="Search"
              suppressHydrationWarning
              style={{ background: 'none', border: 'none', color: '#f9f6ef', fontSize: 20, padding: 4, cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={e => e.target.style.color = '#c9a84c'}
              onMouseLeave={e => e.target.style.color = '#f9f6ef'}
            >🔍</button>

            {user && user?.role !== 'admin' && (
              <Link href="/wishlist" title="My Wishlist" style={{ fontSize: 20, textDecoration: 'none' }}>❤️</Link>
            )}

            {!isAdminPortal && user?.role !== 'admin' && (
              <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>🛒</span>
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: -8, right: -8, background: '#c9a84c', color: '#0a0a0a', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/profile" style={{ fontSize: 13, color: '#c9a84c' }}>
                  👤 {user.name?.split(' ')[0] || user.phoneNumber?.slice(-4)}
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="badge-gold" style={{ display: 'inline-block', cursor: 'pointer', textDecoration: 'none' }}>Admin</Link>
                )}
                <button onClick={logout} style={{ background: 'none', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-gold" style={{ padding: '8px 20px', fontSize: 13 }}>Login</Link>
            )}

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: '#f9f6ef', fontSize: 24, display: 'none', cursor: 'pointer' }}
              className="menu-btn"
            >☰</button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/search?q=${searchQuery}`; }}>
              <input
                className="input-luxury"
                placeholder="Search for luxury watches, shoes, perfumes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                style={{ maxWidth: 600 }}
              />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ background: '#111', borderTop: '1px solid rgba(201,168,76,0.15)', padding: 20 }}>
            <Link href="/products" style={{ display: 'block', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#c9a84c', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>All Products</Link>
            {categories.map(cat => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`}
                style={{ display: 'block', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f9f6ef', fontSize: 15 }}
                onClick={() => setMenuOpen(false)}
              >{cat}</Link>
            ))}
            <Link href="/deals" style={{ display: 'block', padding: '12px 0', color: '#c9a84c', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>🔥 Deals</Link>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 1200px) {
          .desktop-links { gap: 16px !important; }
          .nav-link { font-size: 11px !important; }
          .logo-text { font-size: 1.2rem !important; }
          .nav-actions { gap: 12px !important; }
        }
        @media (max-width: 1050px) {
          .hide-tablet { display: none !important; }
          .menu-btn { display: block !important; }
        }
        @media (max-width: 768px) {
          .menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
