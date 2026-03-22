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
      toast.success(wishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist!');
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
            <img src={getMediaUrl(product.images[0])} alt={product.title} style={{ aspectRatio: '1', objectFit: 'cover', width: '100%' }} />
          ) : (
            <div style={{ aspectRatio: '1', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
              🏷️
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
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid ${wishlisted ? 'rgba(220,53,69,0.6)' : 'rgba(201,168,76,0.3)'}`,
              borderRadius: '50%', width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, backdropFilter: 'blur(4px)', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {wishlisted ? '❤️' : '🤍'}
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
    </Link>
  );
}
