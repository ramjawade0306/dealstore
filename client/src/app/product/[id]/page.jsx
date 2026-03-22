'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { getMediaUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => { setProduct(data); if (data.sizes?.length) setSelectedSize(data.sizes[0]); })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const discount = product ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) return toast.error('Please select a size');
    addToCart(product, quantity, selectedSize);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) return toast.error('Please select a size');
    addToCart(product, quantity, selectedSize);
    router.push('/checkout');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Buy ${product.title} at Low Price Luxury`,
          text: `Check out ${product.title} for just ₹${product.discountPrice?.toLocaleString('en-IN')}!`,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader-gold" /></div>;
  if (!product) return <div style={{ textAlign: 'center', padding: 100, color: '#6b6b6b' }}>Product not found</div>;

  return (
    <div style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>

          {/* Image Gallery */}
          <div>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.15)', aspectRatio: '1', position: 'relative' }}>
              {product.images?.[selectedImage] ? (
                <img src={getMediaUrl(product.images[selectedImage])} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>🏷️</div>
              )}
              <div style={{ position: 'absolute', top: 16, left: 16 }}><span className="badge-gold">{discount}% OFF</span></div>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: `2px solid ${i === selectedImage ? '#c9a84c' : 'rgba(201,168,76,0.2)'}`, padding: 0, cursor: 'pointer', background: 'none' }}>
                    <img src={getMediaUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Video */}
            {product.video && (
              <div style={{ marginTop: 20 }}>
                <p style={{ color: '#c9a84c', fontSize: 13, marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Product Video</p>
                <video src={product.video} controls style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(201,168,76,0.15)' }} />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p style={{ color: '#c9a84c', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{product.brand}</p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: 20 }}>{product.title}</h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#e8c97a', fontWeight: 700 }}>
                ₹{product.discountPrice?.toLocaleString('en-IN')}
              </span>
              <span style={{ textDecoration: 'line-through', color: '#6b6b6b', fontSize: 18 }}>
                ₹{product.originalPrice?.toLocaleString('en-IN')}
              </span>
              <span className="badge-gold">{discount}% OFF</span>
            </div>
            <p style={{ color: '#4CAF50', fontSize: 14, marginBottom: 24 }}>
              You save ₹{(product.originalPrice - product.discountPrice)?.toLocaleString('en-IN')}
            </p>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: product.stock > 0 ? (product.stock <= 9 ? '#FF9800' : '#4CAF50') : '#f44336' }} />
              <span style={{ color: product.stock > 0 ? (product.stock <= 9 ? '#FF9800' : '#4CAF50') : '#f44336', fontSize: 13, fontWeight: product.stock > 0 && product.stock <= 9 ? 600 : 400 }}>
                {product.stock === 0 ? 'Out of Stock' :
                 product.stock <= 9 ? `Selling fast, only ${product.stock} are left` : 'In Stock'}
              </span>
            </div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: '#6b6b6b', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Size: <span style={{ color: '#c9a84c' }}>{selectedSize}</span>
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '8px 18px', borderRadius: 6,
                        border: `1.5px solid ${selectedSize === size ? '#c9a84c' : 'rgba(201,168,76,0.2)'}`,
                        background: selectedSize === size ? '#c9a84c' : 'transparent',
                        color: selectedSize === size ? '#0a0a0a' : '#f9f6ef',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
                      }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <span style={{ color: '#6b6b6b', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Qty:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(201,168,76,0.3)', borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: 40, height: 40, background: '#161616', border: 'none', cursor: 'pointer', color: '#f9f6ef', fontSize: 18 }}>−</button>
                <span style={{ width: 48, textAlign: 'center', fontSize: 16, fontWeight: 600 }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} style={{ width: 40, height: 40, background: '#161616', border: 'none', cursor: 'pointer', color: '#f9f6ef', fontSize: 18 }}>+</button>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
              <button className="btn-gold" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={handleAddToCart} disabled={product.stock === 0}>
                🛒 Add to Cart
              </button>
              <button className="btn-outline" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={handleBuyNow} disabled={product.stock === 0}>
                ⚡ Buy Now
              </button>
            </div>
            <button className="btn-outline" onClick={handleShare} style={{ width: '100%', padding: 12, fontSize: 14, marginBottom: 32, borderColor: 'rgba(201,168,76,0.3)', color: '#c9a84c' }}>
              ↗️ Share this Product
            </button>

            {/* Description */}
            <div style={{ borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: 24 }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 12, color: '#c9a84c' }}>Description</h3>
              <p style={{ color: '#6b6b6b', lineHeight: 1.8, fontSize: 15 }}>{product.description}</p>
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 28 }}>
              {['🚚 Fast Delivery', '🔄 Easy Replacement', '💯 Authentic Product', '🔒 Secure Payment'].map(badge => (
                <div key={badge} style={{ background: '#161616', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#6b6b6b', border: '1px solid rgba(201,168,76,0.1)' }}>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
