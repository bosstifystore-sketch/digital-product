import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {sent ? (
          /* ── Success State ── */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64,
              background: 'rgba(13,148,136,0.15)',
              border: '1px solid rgba(13,148,136,0.3)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle size={28} color="var(--accent-light)" />
            </div>
            <h1 className="auth-title" style={{ fontSize: '1.5rem', marginBottom: 10 }}>
              Email Sent! 📬
            </h1>
            <p className="auth-subtitle" style={{ marginBottom: 28 }}>
              We've sent a password reset link to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              Please check your inbox (and spam folder).
            </p>
            <Link to="/login" className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }}>
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        ) : (
          /* ── Form State ── */
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52,
                background: 'rgba(13,148,136,0.15)',
                border: '1px solid rgba(13,148,136,0.3)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Mail size={22} color="var(--accent-light)" />
              </div>
              <h1 className="auth-title">Forgot Password?</h1>
              <p className="auth-subtitle">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {error && (
              <div className="auth-error" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleReset}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                id="forgot-submit"
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={loading}
              >
                <Mail size={16} />
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-divider" style={{ marginTop: 24 }}>
              Remember your password?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
