import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Shield } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }

    // Check if admin
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      await supabase.auth.signOut()
      setError('Database Error: ' + profileError.message)
      setLoading(false)
      return
    }

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Access denied. Admin only.')
      setLoading(false)
      return
    }

    navigate('/admin/dashboard')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={24} style={{ color: '#a855f7' }} />
          </div>
          <h1 className="auth-title">Admin Access</h1>
          <p className="auth-subtitle">Bosstify Admin Panel</p>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input id="admin-email" type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="admin-password" type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button id="admin-login-btn" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            <Shield size={16} />
            {loading ? 'Verifying...' : 'Access Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
