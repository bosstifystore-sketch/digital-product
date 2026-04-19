import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Lock, CheckCircle } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // When the user clicks the link in email, Supabase creates a session in the URL hash.
    // If we're authenticated, we can update the password.
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // We're ready to update the password
      }
    })
  }, [])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, background: 'rgba(13,148,136,0.15)',
              border: '1px solid rgba(13,148,136,0.3)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <CheckCircle size={28} color="var(--accent-light)" />
            </div>
            <h1 className="auth-title">Password Updated!</h1>
            <p className="auth-subtitle">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52, background: 'rgba(13,148,136,0.15)',
                border: '1px solid rgba(13,148,136,0.3)', borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Lock size={22} color="var(--accent-light)" />
              </div>
              <h1 className="auth-title">Reset Password</h1>
              <p className="auth-subtitle">Enter your new password below.</p>
            </div>
            
            {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

            <form className="auth-form" onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                <Lock size={16} />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
