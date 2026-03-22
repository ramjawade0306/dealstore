'use client';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: '#0a0a0a', borderTop: '1px solid rgba(201,168,76,0.15)', padding: '60px 24px 30px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              LOW PRICE LUXURY
            </h3>
            <p style={{ color: '#6b6b6b', fontSize: 14, marginTop: 16, lineHeight: 1.8 }}>
              Premium luxury products at prices everyone can afford. Quality is our promise.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <a href="https://wa.me/916264267644" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                💬 WhatsApp
              </a>
              <a href="https://www.instagram.com/low_price_luxury?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                📸 Instagram
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 style={{ color: '#c9a84c', letterSpacing: '0.1em', fontSize: 12, textTransform: 'uppercase', marginBottom: 20 }}>Categories</h5>
            {['Watches', 'Shoes', 'Perfumes', 'Bags', 'Accessories'].map(cat => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`}
                style={{ display: 'block', color: '#6b6b6b', fontSize: 14, marginBottom: 10, transition: 'color 0.3s' }}
                onMouseEnter={e => e.target.style.color = '#c9a84c'}
                onMouseLeave={e => e.target.style.color = '#6b6b6b'}
              >{cat}</Link>
            ))}
          </div>

          {/* Customer */}
          <div>
            <h5 style={{ color: '#c9a84c', letterSpacing: '0.1em', fontSize: 12, textTransform: 'uppercase', marginBottom: 20 }}>Customer</h5>
            {[['My Orders', '/profile/orders'], ['Track Order', '/profile/orders'], ['Wishlist', '/wishlist'], ['Cart', '/cart']].map(([label, href]) => (
              <Link key={label} href={href}
                style={{ display: 'block', color: '#6b6b6b', fontSize: 14, marginBottom: 10, transition: 'color 0.3s' }}
                onMouseEnter={e => e.target.style.color = '#c9a84c'}
                onMouseLeave={e => e.target.style.color = '#6b6b6b'}
              >{label}</Link>
            ))}
          </div>

          {/* Info */}
          <div>
            <h5 style={{ color: '#c9a84c', letterSpacing: '0.1em', fontSize: 12, textTransform: 'uppercase', marginBottom: 20 }}>Info</h5>
            <p style={{ color: '#6b6b6b', fontSize: 14, lineHeight: 1.8 }}>
              📞 +91 6264267644<br />
              📦 Ships via XpressBees, Delhivery, Ekart<br />
              🔄 Replacement on damaged products<br />
              💰 COD Available
            </p>
          </div>
        </div>

        <div className="gold-line" />
        <div className="gold-line" />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, gap: 16 }}>
          <p style={{ color: '#6b6b6b', fontSize: 13, margin: 0 }}>
            © {year} Low Price Luxury. All rights reserved.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#6b6b6b', display: 'flex', alignItems: 'center', gap: 6 }}>
            Designed & Developed by
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.05em' }}>
              Ram Jawade
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
