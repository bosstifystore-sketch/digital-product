import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Users, Link as LinkIcon, AlertCircle } from 'lucide-react'
import CheckoutModal from '../../components/CheckoutModal'

export default function BuyFollowers() {
  const { user } = useAuth()
  const [rate, setRate] = useState(90) // default 90 per 1000
  const [followers, setFollowers] = useState(5000)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchRate() {
      const { data } = await supabase.from('settings').select('*').eq('key', 'follower_rate').single()
      if (data && data.value) setRate(Number(data.value))
      setLoading(false)
    }
    fetchRate()
  }, [])

  const price = (followers / 1000) * rate

  const handleDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFollowers(Number(e.target.value))
  }

  const handleBuy = () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setError('')
    if (!url.includes('instagram.com/')) {
      setError('Please enter a valid Instagram profile URL.')
      return
    }
    setCheckoutOpen(true)
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal 
          isOpen={checkoutOpen}
          amount={price}
          product={{ 
            id: 'dynamic-follower-package', 
            title: `${followers.toLocaleString('en-IN')} Instagram Followers`, 
            description: `Deliver to: ${url}`,
            price: price,
            category: 'followers',
            images: ['https://placehold.co/400x400/7c3aed/ffffff?text=Followers'],
            stock_status: true 
          }}
          userProfileUrl={url}
          onClose={() => setCheckoutOpen(false)}
        />
      )}

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', background: 'rgba(124, 58, 237, 0.1)', padding: 14, borderRadius: '50%', marginBottom: 16 }}>
            <Users size={32} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 6vw, 2.5rem)', fontWeight: 800, marginBottom: 10 }}>Boost Your Custom Followers</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
            Choose exactly how many followers you want and get instant delivery.
          </p>
        </div>

        <div className="card" style={{ padding: 'clamp(18px, 5vw, 32px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--accent), var(--accent-light))' }} />
          
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Amount</h3>
                <p style={{ fontSize: 'clamp(1.75rem, 8vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {followers.toLocaleString('en-IN')}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="tag tag-completed">High Quality</span>
              </div>
            </div>

            <input 
              type="range" 
              min={1000} 
              max={100000} 
              step={1000} 
              value={followers} 
              onChange={handleDrag}
              style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: 8 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>1K</span>
              <span>100K</span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Target Profile URL</label>
            <div style={{ position: 'relative' }}>
              <LinkIcon size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: 42 }}
                placeholder="https://instagram.com/your_username"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={14}/>{error}</p>}
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: 'clamp(14px, 4vw, 24px)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24, border: '1px solid var(--border)' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 4 }}>Total Cost</p>
              <h2 style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 800 }}>₹{price.toLocaleString('en-IN')}</h2>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Rate</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{rate} per 1K</p>
            </div>
          </div>

          <button className="btn btn-primary btn-lg w-full" onClick={handleBuy} style={{ fontSize: '1.2rem', padding: '16px' }}>
            Checkout and Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}
