'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('/users/wishlist').then(({ data }) => setWishlist(data)).catch(() => {}).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [user]);

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 70 }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#c9a84c', fontSize: '2rem', marginBottom: 16 }}>Login to view your wishlist</h2>
      <Link href="/login" className="btn-gold">Login</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container">
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', marginBottom: 40 }}>❤️ My Wishlist</h1>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader-gold" /></div> :
          wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ color: '#6b6b6b', fontSize: 18, marginBottom: 24 }}>Your wishlist is empty</p>
              <Link href="/products" className="btn-outline">Explore Products</Link>
            </div>
          ) : <div className="insta-grid">{wishlist.map(p => <ProductCard key={p._id} product={p} />)}</div>
        }
      </div>
    </div>
  );
}
