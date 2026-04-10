import { useEffect, useState } from 'react'
import { supabase, type Order } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Package, Clock } from 'lucide-react'

export default function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (data) setOrders(data as Order[])
    setLoading(false)
  }

  useEffect(() => {
    if (user) fetchOrders()
  }, [user])

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">Track all your purchased digital products</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>No orders yet</h3>
          <p>You haven't purchased anything yet. Browse our products!</p>
          <a href="/" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Browse Products</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const details = order.product_details as Record<string, string>
            return (
              <div key={order.id} className="card order-card" style={{ flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    {details.image ? (
                      <img
                        src={details.image}
                        alt={details.title}
                        style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/13131f/7c3aed?text=D' }}
                      />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={22} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                    <div className="order-card-info" style={{ minWidth: 0 }}>
                      <p className="order-card-product" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{details.title || 'Product'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--accent-light)', textTransform: 'capitalize', marginTop: 2 }}>
                        {details.category?.replace('_', ' ')}
                      </p>
                      <p className="order-card-date" style={{ marginTop: 4 }}>
                        <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <p className="order-card-price">₹{Number(details.price || 0).toLocaleString('en-IN')}</p>
                    <span className={`tag tag-${order.status}`}>{order.status}</span>
                  </div>
                </div>
                
                {order.status === 'completed' && details.category === 'followers' && (
                  <div style={{ width: '100%', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid var(--accent)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: '1.5rem' }}>⏳</span>
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Followers Are On Their Way!</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          Your order has been confirmed. Followers will be sent to your profile within <strong>24 hours</strong>.
                          If not received, please contact support.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {order.status === 'completed' && details.credentials && details.credentials !== 'follower_order' && (
                  <div style={{ width: '100%', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--success)' }}>Account Details (Keep Secure)</p>
                    <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, marginTop: 8, fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', border: '1px solid var(--border)', lineHeight: 1.6 }}>
                      {details.credentials}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
