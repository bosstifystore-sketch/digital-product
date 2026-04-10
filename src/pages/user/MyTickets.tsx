import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { LifeBuoy, PlusCircle, MessageSquare } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  message: string
  status: string
  admin_reply: string | null
  replies: { sender: string; text: string; created_at: string }[] | null
  created_at: string
}

export default function MyTickets() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})

  async function fetchTickets() {
    if (!user) return
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setTickets(data as Ticket[])
    setLoading(false)
  }

  useEffect(() => {
    fetchTickets()
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      setError('Please fill out all fields')
      return
    }
    setError('')
    setSubmitting(true)

    const { error: insertError } = await supabase
      .from('tickets')
      .insert({
        user_id: user?.id,
        subject,
        message,
        status: 'open'
      })

    if (insertError) {
      setError('Failed to submit ticket. Please try again later.')
    } else {
      setShowForm(false)
      setSubject('')
      setMessage('')
      fetchTickets()
    }
    setSubmitting(false)
  }

  async function handleSendReply(ticket: Ticket) {
    const text = replyTexts[ticket.id]
    if (!text || !text.trim()) return

    const newReply = { sender: 'user', text, created_at: new Date().toISOString() }
    const currentReplies = ticket.replies || []
    const updatedReplies = [...currentReplies, newReply]

    const { error: replyError } = await supabase
      .from('tickets')
      .update({ replies: updatedReplies })
      .eq('id', ticket.id)

    if (!replyError) {
      setReplyTexts(prev => ({ ...prev, [ticket.id]: '' }))
      fetchTickets()
    }
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800 }}>Support Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Get help with your orders and account</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowForm(true)}>
            <PlusCircle size={16} /> New Ticket
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Create a Support Ticket</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Briefly describe your issue..." 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message Details</label>
              <textarea 
                className="form-input" 
                rows={5} 
                placeholder="Please provide order IDs or specific details..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tickets.length === 0 && !showForm ? (
        <div className="empty-state" style={{ padding: '60px 20px' }}>
          <LifeBuoy size={48} style={{ color: 'var(--accent)', opacity: 0.5, marginBottom: 16 }} />
          <h3>No support tickets</h3>
          <p style={{ color: 'var(--text-muted)' }}>You haven't submitted any support requests yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {tickets.map(ticket => (
            <div key={ticket.id} className="card" style={{ padding: '20px 24px', borderLeft: `4px solid ${ticket.status === 'open' ? '#f59e0b' : '#10b981'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{ticket.subject}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Ticket #{ticket.id.slice(0, 8)} • {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`tag ${ticket.status === 'open' ? 'tag-cancelled' : 'tag-completed'}`} style={{ alignSelf: 'flex-start' }}>
                  {ticket.status === 'open' ? '⏳ Open' : '✅ Closed'}
                </span>
              </div>
              
              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                {ticket.message}
              </div>

              {/* Chat Thread */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: ticket.status === 'open' ? 16 : 0 }}>
                {ticket.admin_reply && (!ticket.replies || ticket.replies.length === 0) && (
                  <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid var(--accent)', padding: 12, borderRadius: 8, alignSelf: 'flex-start', maxWidth: '85%' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <MessageSquare size={14} /> Admin Reply (Legacy)
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{ticket.admin_reply}</p>
                  </div>
                )}

                {(ticket.replies || []).map((reply, idx) => (
                  <div key={idx} style={{ 
                    background: reply.sender === 'user' ? 'rgba(124,58,237,0.1)' : 'var(--bg-card)', 
                    padding: 12, borderRadius: 8, 
                    border: reply.sender === 'user' ? '1px solid var(--accent)' : '1px solid var(--border)',
                    alignSelf: reply.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}>
                    <p style={{ fontSize: '0.75rem', color: reply.sender === 'user' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>
                      {reply.sender === 'user' ? 'You' : 'Admin'} <span style={{ opacity: 0.6, fontWeight: 400 }}>• {new Date(reply.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </p>
                    <p style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{reply.text}</p>
                  </div>
                ))}
              </div>

              {ticket.status === 'open' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Type your reply..." 
                    value={replyTexts[ticket.id] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendReply(ticket);
                    }}
                    style={{ flex: 1 }}
                  />
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleSendReply(ticket)}
                    disabled={!replyTexts[ticket.id]?.trim()}
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
