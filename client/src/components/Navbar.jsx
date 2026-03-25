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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.png" alt="Logo" className="nav-logo-img" style={{ height: 40, width: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(201,168,76,0.2)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="logo-text gold-text" style={{ fontSize: '1.3rem', lineHeight: 1, color: '#f9f6ef' }}>LOW PRICE</span>
              <span className="logo-subtext gold-text" style={{ fontSize: '0.6rem', color: '#c9a84c', letterSpacing: 3, marginTop: 2 }}>LUXURY</span>
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
            <Link href="/deals" className="nav-link" style={{ fontSize: 13, letterSpacing: '0.05em', color: '#c9a84c', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Deals
            </Link>
          </div>

          {/* Actions */}
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              title="Search"
              suppressHydrationWarning
              style={{ background: 'none', border: 'none', color: '#f9f6ef', padding: 4, cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={e => e.target.style.color = '#c9a84c'}
              onMouseLeave={e => e.target.style.color = '#f9f6ef'}
              className="hide-mobile"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>

            {user && user?.role !== 'admin' && (
              <Link href="/wishlist" title="My Wishlist" style={{ textDecoration: 'none', color: '#f9f6ef' }} className="hide-mobile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </Link>
            )}

            {!isAdminPortal && user?.role !== 'admin' && (
              <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#f9f6ef' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: -8, right: -8, background: '#c9a84c', color: '#0a0a0a', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/profile" style={{ fontSize: 13, color: '#c9a84c' }} className="hide-mobile">
                  👤 {user.name?.split(' ')[0] || user.phoneNumber?.slice(-4)}
                </Link>
                <Link href="/profile" style={{ color: '#c9a84c', display: 'flex', alignItems: 'center' }} className="show-mobile-only">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="badge-gold hide-mobile" style={{ display: 'inline-block', cursor: 'pointer', textDecoration: 'none' }}>Admin</Link>
                )}
                <button onClick={logout} className="hide-mobile" style={{ background: 'none', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-gold hide-mobile" style={{ padding: '8px 20px', fontSize: 13 }}>Login</Link>
                <Link href="/login" style={{ color: '#c9a84c', display: 'flex', alignItems: 'center' }} className="show-mobile-only">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>
              </>
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
            {/* Search Input for Mobile */}
            <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/search?q=${searchQuery}`; }} style={{ marginBottom: 20 }}>
              <input
                className="input-luxury"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', fontSize: 16 }}
              />
            </form>

            <Link href="/products" style={{ display: 'block', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#c9a84c', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>All Products</Link>
            {categories.map(cat => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`}
                style={{ display: 'block', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f9f6ef', fontSize: 15 }}
                onClick={() => setMenuOpen(false)}
              >{cat}</Link>
            ))}
            <Link href="/deals" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#c9a84c', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Deals
            </Link>
             {user ? (
                <>
                 <Link href="/wishlist" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f9f6ef' }} onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    My Wishlist
                 </Link>
                 <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f9f6ef' }} onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    My Profile
                 </Link>
                 <button onClick={() => { logout(); setMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '16px 0', background: 'none', color: '#c9a84c', fontWeight: 600 }}>Logout</button>
                </>
             ) : (
                <Link href="/login" style={{ display: 'block', padding: '16px 0', color: '#c9a84c', fontWeight: 700 }} onClick={() => setMenuOpen(false)}>Login / Sign Up</Link>
             )}
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
          .hide-mobile { display: none !important; }
          .logo-text { font-size: 1.1rem !important; }
          .logo-subtext { font-size: 0.45rem !important; }
          .nav-logo-img { height: 36px !important; width: 36px !important; }
          .nav-actions { gap: 16px !important; }
          .show-mobile-only { display: flex !important; }
        }
        .gold-text {
          background: linear-gradient(135deg, #c9a84c 0%, #f9f6ef 50%, #e8c97a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }
        @media (max-width: 768px) {
          .menu-btn { display: block !important; }
          .logo-text { font-size: 1rem !important; }
          nav { padding: 0 12px !important; }
          .nav-actions { gap: 12px !important; }
        }
        .show-mobile-only { display: none; }
      `}</style>
    </>
  );
}
