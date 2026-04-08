import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Package, ShoppingBag, LogOut, Settings, Zap } from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
}


export default function Dashboard() {
  const { signOut } = useAuth()
  const location = useLocation()
  const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 })
  const [followerRate, setFollowerRate] = useState('90')
  const [savingRate, setSavingRate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  
  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function fetchStats() {
    const [{ count: products }, { data: orders }, { data: rateData }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('product_details, status'),
      supabase.from('settings').select('*').eq('key', 'follower_rate').single()
    ])

    if (rateData && rateData.value) {
      setFollowerRate(String(rateData.value))
    }

    const revenue = (orders || []).reduce((sum, o) => {
      const details = o.product_details as Record<string, number>
      return sum + (Number(details?.price) || 0)
    }, 0)
    const pending = (orders || []).filter(o => o.status === 'pending').length

    setStats({ totalProducts: products || 0, totalOrders: orders?.length || 0, totalRevenue: revenue, pendingOrders: pending })
    setLoading(false)
  }

  useEffect(() => { fetchStats() }, [])

  async function updateRate() {
    setSavingRate(true)
    const val = parseFloat(followerRate)
    if (isNaN(val) || val <= 0) {
      showToast('Enter a valid rate', 'error')
      setSavingRate(false)
      return
    }
    const { error } = await supabase.from('settings').upsert({ key: 'follower_rate', value: val })
    if (error) showToast('Failed to update rate', 'error')
    else showToast('Rate updated successfully!')
    setSavingRate(false)
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/products', label: 'Products', icon: <Package size={18} /> },
    { path: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
  ]

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="admin-layout">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div style={{ padding: '8px 14px 20px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>⚡ Bosstify Admin</span>
          </div>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
              {item.icon} {item.label}
            </Link>
          ))}
          <div className="admin-signout-wrap">
            <button onClick={signOut} className="admin-nav-item admin-signout-btn">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="admin-content">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800 }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Overview of your store</p>
          </div>

          {loading ? (
            <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.15)' }}><Package size={22} style={{ color: '#a855f7' }} /></div>
                <p className="stat-label">Total Products</p>
                <p className="stat-value">{stats.totalProducts}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}><ShoppingBag size={22} style={{ color: '#10b981' }} /></div>
                <p className="stat-label">Total Orders</p>
                <p className="stat-value">{stats.totalOrders}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}><span style={{ fontSize: '1.2rem' }}>₹</span></div>
                <p className="stat-label">Total Revenue</p>
                <p className="stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}><LayoutDashboard size={22} style={{ color: '#ef4444' }} /></div>
                <p className="stat-label">Pending Orders</p>
                <p className="stat-value">{stats.pendingOrders}</p>
              </div>
            </div>

            {/* SETTINGS MODULE */}
            <div style={{ marginTop: 48, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <Settings size={20} style={{ color: 'var(--accent-light)' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Service Settings</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Configure automated dynamic services parameters</p>
                </div>
              </div>
              
              <div className="card" style={{ maxWidth: 460, width: '100%', padding: 24, position: 'relative', overflow: 'hidden' }}>
                {/* Decorative background glow */}
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
                
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Zap size={16} style={{ color: '#f59e0b' }} /> Instagram Followers Rate
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                  Set the static price for every <strong style={{color: 'var(--text-primary)'}}>1,000 followers</strong> requested by customers. This updates the public catalog dynamically.
                </p>
                
                <div className="form-group">
                  <label className="form-label">Pricing Rate (₹)</label>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 140 }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        style={{ width: '100%', paddingLeft: 32, fontSize: '1.1rem', fontWeight: 600 }}
                        value={followerRate}
                        onChange={e => setFollowerRate(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={updateRate} disabled={savingRate} style={{ padding: '0 28px', flexShrink: 0 }}>
                      {savingRate ? 'Saving...' : 'Update Rate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        </main>
      </div>
    </div>
  )
}
