import { useEffect, useState } from 'react'
import { supabase, type Product } from '../../lib/supabaseClient'
import ProductCard from '../../components/ProductCard'
import { Search, Zap } from 'lucide-react'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .neq('category', 'followers')
      .order('created_at', { ascending: false })
    if (data) setProducts(data as Product[])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filtered = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || p.category === category
    return matchSearch && matchCat
  })

  return (
    <>
      {/* HERO */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Premium instagram<br /><span>Products</span>
          </h1>
          <p className="hero-subtitle">
            Buy verified accounts and follower packages. Instant delivery guaranteed.
          </p>
          <div className="hero-badges" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>
              <Zap size={12} /> Instant Delivery
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a855f7', padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>
              🔒 Verified & Secure
            </span>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTER */}
      <div className="container" style={{ paddingBottom: 48 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="product-search"
              type="text"
              className="form-input"
              placeholder="Search products..."
              style={{ paddingLeft: 38, width: '100%' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {cat === 'all' ? 'All' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: 300 }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
