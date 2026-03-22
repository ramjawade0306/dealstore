'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => { 
    if (!user) router.push('/login'); 
  }, [user, router]);

  if (!user) return null;

  return (
    <div style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <div style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: '48px 40px', textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>
            👤
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: 8 }}>{user.name || 'My Account'}</h1>
          <p style={{ color: '#c9a84c', fontSize: 16 }}>{user.phoneNumber}</p>
          {user.role === 'admin' && <span className="badge-gold" style={{ display: 'inline-block', marginTop: 12 }}>Admin Account</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { href: '/profile/orders', label: '📦 My Orders', desc: 'View and track your orders' },
            { href: '/wishlist', label: '❤️ Wishlist', desc: 'Products you saved' },
            { href: '/cart', label: '🛒 My Cart', desc: 'Items ready to checkout' },
            ...(user.role === 'admin' ? [{ href: '/admin', label: '⚙️ Admin Dashboard', desc: 'Manage your store' }] : []),
          ].map(item => (
            <Link key={item.href} href={item.href}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: '#161616', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, transition: 'all 0.3s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)'; e.currentTarget.style.transform = 'none'; }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{item.label}</p>
                <p style={{ color: '#6b6b6b', fontSize: 13 }}>{item.desc}</p>
              </div>
              <span style={{ color: '#c9a84c', fontSize: 20 }}>→</span>
            </Link>
          ))}
        </div>

        <button onClick={logout} className="btn-outline" style={{ width: '100%', marginTop: 24, padding: 14, borderColor: '#f44336', color: '#f44336' }}>
          Logout
        </button>
      </div>
    </div>
  );
}
