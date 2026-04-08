import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Package, ShoppingBag, LogOut, Eye, X } from 'lucide-react'

interface OrderRow {
  id: string
  user_id: string
  product_id: string
  product_details: Record<string, string>
  status: string
  created_at: string
  payment_screenshot_url?: string
  users?: { email: string }
}

export default function AdminOrders() {
  const { signOut } = useAuth()
  const location = useLocation()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  
  // Custom Approval Modal state
  const [approvalModal, setApprovalModal] = useState<{ open: boolean; order: OrderRow | null }>({ open: false, order: null })
  const [igId, setIgId] = useState('')
  const [igPass, setIgPass] = useState('')

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, users(email)')
      .order('created_at', { ascending: false })
    if (data) setOrders(data as OrderRow[])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function updateStatus(order: OrderRow, status: string, customCreds?: string) {
    if (status === 'completed' && !customCreds && order.status !== 'completed') {
      // Open modal instead of immediately updating
      setApprovalModal({ open: true, order })
      setIgId('')
      setIgPass('')
      return
    }

    let newDetails = order.product_details;
    if (customCreds) {
      newDetails = { ...order.product_details, credentials: customCreds }
    }

    const { error } = await supabase.from('orders').update({ status, product_details: newDetails }).eq('id', order.id)
    
    if (error) {
      showToast('Failed to update status', 'error')
      return
    }
     
    if (status === 'completed') {
      showToast('Order Approved! Sending email...')
      
      const email = order.users?.email
      if (email) {
        const { error: invokeError } = await supabase.functions.invoke('send-order-email', {
          body: { 
            email, 
            productTitle: order.product_details?.title,
            amount: order.product_details?.price,
            credentials: customCreds || ''
          }
        })
        if (invokeError) {
          console.error("Email Error:", invokeError)
          showToast('Status updated, but email failed to send', 'error')
        } else {
          showToast('Status updated & Email dispatched successfully!')
        }
      } else {
        showToast('Status updated! (No email found for user)', 'error')
      }
    } else {
      showToast('Status updated!')
    }
    
    fetchOrders() 
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

        <main className="admin-content">
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800 }}>Orders</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{orders.length} orders total</p>
          </div>

          {loading ? (
            <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} />
              <h3>No orders yet</h3>
            </div>
          ) : (
            <div className="table-wrap">
              <table style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Payment Proof</th>
                    <th>Price</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        #{order.id.slice(0, 8)}...
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {order.users?.email || order.user_id.slice(0, 12) + '...'}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {order.product_details?.title || '—'}
                      </td>
                      <td>
                        {order.payment_screenshot_url ? (
                          <a 
                            href={order.payment_screenshot_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 4 }}
                          >
                            <Eye size={14} /> View
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ₹{Number(order.product_details?.price || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order, e.target.value)}
                          className="form-input btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.8rem', width: 'auto' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* APPROVAL MODAL */}
      {approvalModal.open && approvalModal.order && (
        <div className="modal-overlay" onClick={() => setApprovalModal({ open: false, order: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Approve Order</h2>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setApprovalModal({ open: false, order: null })}
              >
                <X size={16} />
              </button>
            </div>
            
            {approvalModal.order.product_details?.category === 'followers' ? (
              /* FOLLOWER ORDER — Simple confirmation */
              <>
                <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid var(--accent)', padding: 16, borderRadius: 10, marginBottom: 20 }}>
                  <p style={{ fontWeight: 700, marginBottom: 6 }}>Follower Order Details:</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Product: <strong>{approvalModal.order.product_details?.title}</strong>
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                    Target: <strong>{approvalModal.order.product_details?.target_url || 'N/A'}</strong>
                  </p>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                  Clicking confirm will notify the buyer that their followers will be delivered within 24 hours.
                </p>
                <button 
                  className="btn btn-primary btn-lg w-full"
                  onClick={() => {
                    updateStatus(approvalModal.order!, 'completed', 'follower_order');
                    setApprovalModal({ open: false, order: null });
                  }}
                >
                  ✅ Confirm — Followers Sent!
                </button>
              </>
            ) : (
              /* INSTAGRAM ACCOUNT ORDER — ID + Password form */
              <>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
                  Enter the Instagram ID and Password to deliver to the buyer for <strong>{approvalModal.order.product_details?.title}</strong>.
                </p>

                <div className="form-group">
                  <label className="form-label">Instagram Username / ID</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. digistore_insta"
                    value={igId}
                    onChange={e => setIgId(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. secretPass123"
                    value={igPass}
                    onChange={e => setIgPass(e.target.value)}
                  />
                </div>

                <button 
                  className="btn btn-primary btn-lg w-full" 
                  style={{ marginTop: 10 }}
                  onClick={() => {
                    const combinedCredentials = `Username/ID: ${igId}\nPassword: ${igPass}`;
                    updateStatus(approvalModal.order!, 'completed', combinedCredentials);
                    setApprovalModal({ open: false, order: null });
                  }}
                >
                  Confirm & Send Details
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
