import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Package, ShoppingBag, LogOut, LifeBuoy, X, CheckCircle, Send } from 'lucide-react'

interface Ticket {
  id: string
  user_id: string
  subject: string
  message: string
  status: string
  admin_reply: string | null
  created_at: string
  users?: { email: string }
}

export default function AdminTickets() {
  const { signOut } = useAuth()
  const location = useLocation()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  
  // Reply Modal state
  const [replyModal, setReplyModal] = useState<{ open: boolean; ticket: Ticket | null }>({ open: false, ticket: null })
  const [replyText, setReplyText] = useState('')

  async function fetchTickets() {
    const { data } = await supabase
      .from('tickets')
      .select('*, users(email)')
      .order('status', { ascending: false }) // 'open' comes before 'closed' generally, but better to sort by date
      .order('created_at', { ascending: false })
      
    if (data) setTickets(data as Ticket[])
    setLoading(false)
  }

  useEffect(() => { fetchTickets() }, [])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleCloseTicket(ticket: Ticket) {
    const { error } = await supabase.from('tickets').update({ status: 'closed' }).eq('id', ticket.id)
    if (error) {
      showToast('Failed to close ticket', 'error')
    } else {
      showToast('Ticket marked as closed')
      fetchTickets()
    }
  }

  async function submitReply() {
    if (!replyModal.ticket) return
    const { error } = await supabase
      .from('tickets')
      .update({ admin_reply: replyText, status: 'closed' })
      .eq('id', replyModal.ticket.id)

    if (error) {
      showToast('Failed to send reply', 'error')
    } else {
      showToast('Reply sent & ticket closed!')
      setReplyModal({ open: false, ticket: null })
      setReplyText('')
      fetchTickets()
    }
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/products', label: 'Products', icon: <Package size={18} /> },
    { path: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
    { path: '/admin/tickets', label: 'Tickets', icon: <LifeBuoy size={18} /> },
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
            <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800 }}>Support Tickets</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Manage customer inquiries and issues</p>
          </div>

          {loading ? (
            <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <LifeBuoy size={48} style={{ color: 'var(--accent)' }} />
              <h3>No tickets</h3>
            </div>
          ) : (
            <div className="table-wrap">
              <table style={{ minWidth: 800 }}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {ticket.users?.email || ticket.user_id.slice(0, 8) + '...'}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.875rem', maxWidth: 200 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ticket.subject}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                         {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`tag ${ticket.status === 'open' ? 'tag-cancelled' : 'tag-completed'}`} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setReplyModal({ open: true, ticket })
                              setReplyText(ticket.admin_reply || '')
                            }}
                          >
                            View & Reply
                          </button>
                          {ticket.status === 'open' && (
                            <button 
                              className="btn btn-sm" 
                              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                              onClick={() => handleCloseTicket(ticket)}
                            >
                              <CheckCircle size={14} style={{ color: '#10b981' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* REPLY MODAL */}
      {replyModal.open && replyModal.ticket && (
        <div className="modal-overlay" onClick={() => setReplyModal({ open: false, ticket: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Manage Ticket</h2>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setReplyModal({ open: false, ticket: null })}
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From: {replyModal.ticket.users?.email}</p>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4, marginBottom: 8 }}>{replyModal.ticket.subject}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{replyModal.ticket.message}</p>
            </div>

            {replyModal.ticket.status === 'closed' && replyModal.ticket.admin_reply ? (
              <div style={{ background: 'rgba(124,58,237,0.1)', padding: 16, borderRadius: 8, border: '1px solid var(--accent)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>Your Reply:</p>
                <p style={{ fontSize: '0.9rem' }}>{replyModal.ticket.admin_reply}</p>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Send a Reply</label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  placeholder="Type your response here..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
                <button 
                  className="btn btn-primary w-full" 
                  style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                >
                  <Send size={16} /> Reply & Close Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
