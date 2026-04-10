import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, type Product } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { ShoppingCart, ChevronLeft } from 'lucide-react'
import CheckoutModal from '../../components/CheckoutModal'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [error, setError] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  async function fetchProduct(productId: string) {
    const { data } = await supabase.from('products').select('*').eq('id', productId).single()
    if (data) setProduct(data as Product)
    setLoading(false)
  }

  useEffect(() => {
    if (id) fetchProduct(id)
  }, [id])

  function handleBuyClick() {
    if (!user) { navigate('/login'); return }
    if (!product) return
    setError('')
    setCheckoutOpen(true)
  }



  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  if (!product) return (
    <div className="container">
      <div className="empty-state" style={{ paddingTop: 100 }}>
        <h3>Product not found</h3>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Go Home</button>
      </div>
    </div>
  )

  const images = (product.images?.filter(img => img && img.trim() !== '').length)
    ? product.images.filter(img => img && img.trim() !== '')
    : ['https://placehold.co/600x450/13131f/7c3aed?text=Bosstify']

  return (
    <div className="container product-detail">
      <button
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="product-detail-grid">
        {/* IMAGES */}
        <div className="product-images">
          <img
            src={images[activeImg]}
            alt={product.title}
            className="product-main-img"
            style={{ maxHeight: 350, objectFit: 'contain', background: 'var(--bg-surface)', padding: images[activeImg].includes('placehold') ? 0 : 20, borderRadius: 16 }}
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x450/13131f/7c3aed?text=Bosstify' }}
          />
          {images.length > 1 && (
            <div className="product-thumbnails">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className={`product-thumb ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="product-info" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--accent)' }}>
              {product.category.replace('_', ' ')}
            </span>
            <h1 className="product-info-title" style={{ marginTop: 6, fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', lineHeight: 1.2 }}>{product.title}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p className="product-info-price" style={{ margin: 0, fontSize: '2rem' }}>₹{product.price.toLocaleString('en-IN')}</p>
            {product.stock_status && (
              <span className="tag tag-completed">✓ In Stock</span>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          <p className="product-info-desc">{product.description}</p>

          {error && <div className="auth-error">{error}</div>}

          <button
            id="buy-now-btn"
            className="btn btn-primary btn-lg buy-now-btn"
            onClick={handleBuyClick}
            disabled={!product.stock_status}
          >
            <ShoppingCart size={18} />
            {product.stock_status ? 'Buy Now' : 'Out of Stock'}
          </button>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>What you get</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>✅ Instant access after purchase</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>✅ Full account credentials</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>✅ 24/7 support</p>
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <CheckoutModal 
        isOpen={checkoutOpen}
        amount={product.price}
        product={product}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  )
}
