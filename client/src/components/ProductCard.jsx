'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { getMediaUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const discount = Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100);

  // Load initial wishlist state from server
  useEffect(() => {
    if (!user) return;
    api.get('/users/wishlist').then(({ data }) => {
      setWishlisted(data.some(p => p._id === product._id));
    }).catch(() => {});
  }, [user, product._id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (user?.role === 'admin') { toast.error('Admins cannot add to cart'); return; }
    addToCart(product, 1, null);
    toast.success('Added to cart!');
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to save to wishlist'); return; }
    if (wishLoading) return;
    setWishLoading(true);
    try {
      await api.post(`/users/wishlist/${product._id}`);
      setWishlisted(prev => !prev);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch {
      toast.error('Could not update wishlist');
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <Link href={`/product/${product._id}`} style={{ display: 'block' }}>
      <div className="product-card">
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {product.images?.[0] ? (
            <img src={getMediaUrl(product.images[0])} alt={product.title} style={{ aspectRatio: '1', objectFit: 'cover', width: '100%', transition: 'transform 0.5s' }} className="product-img" />
          ) : (
            <div style={{ aspectRatio: '1', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(201,168,76,0.1)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
          )}
          {/* Discount badge */}
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span className="badge-gold">{discount}% OFF</span>
          </div>
          {/* Wishlist button */}
          <button
            onClick={toggleWishlist}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid ${wishlisted ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '50%', width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)', cursor: 'pointer', transition: 'all 0.3s',
              color: wishlisted ? '#c9a84c' : '#fff'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "#c9a84c" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
          {/* Stock indicator */}
          {product.stock === 0 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#f9f6ef', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 14 }}>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="product-card-body">
          <p className="product-card-brand">{product.brand}</p>
          <h3 className="product-card-title" style={{ fontSize: '0.98rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.title}
          </h3>
          <div className="product-card-price">
            <span className="price-original">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
            <span className="price-discount">₹{product.discountPrice?.toLocaleString('en-IN')}</span>
          </div>
          {user?.role !== 'admin' && (
            <button
              className="btn-gold"
              style={{ width: '100%', marginTop: 14, padding: '10px', fontSize: 13 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
      <style jsx>{`
        .product-card {
          background: #111;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.4s;
        }
        .product-card:hover {
          transform: translateY(-8px);
          border-color: rgba(201,168,76,0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .product-card:hover .product-img {
          transform: scale(1.05);
        }
        .product-card-body { padding: 16px; }
        .product-card-brand { color: #c9a84c; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
        .product-card-title { color: #f9f6ef; font-family: 'Cormorant Garamond', serif; font-size: 1.1rem !important; margin-bottom: 12px; }
        .price-original { color: #666; text-decoration: line-through; font-size: 13px; margin-right: 8px; }
        .price-discount { color: #f9f6ef; font-weight: 700; font-size: 1.1rem; }
      `}</style>
    </Link>
  );
}
