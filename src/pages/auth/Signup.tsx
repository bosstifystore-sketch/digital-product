import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { UserPlus, Mail, CheckCircle } from 'lucide-react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else if (data.session) {
      // If "Confirm Email" is OFF in Supabase, user gets a session immediately
      navigate('/')
    } else {
      // If "Confirm Email" is ON, no session is returned yet
      setEmailSent(true)
    }
    setLoading(false)
  }

  // ✅ Email sent — show confirmation screen
  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          {/* Animated icon */}
          <div style={{
            width: 72, height: 72,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.2))',
            border: '1px solid rgba(124,58,237,0.4)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <Mail size={32} style={{ color: '#a855f7' }} />
          </div>

          <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Check Your Email!</h1>
          <p className="auth-subtitle" style={{ marginBottom: 24 }}>
            We've sent a verification link to<br />
            <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
          </p>

          {/* Step-by-step guide */}
          <div style={{
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: 12,
            padding: '16px 20px',
            textAlign: 'left',
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {[
              { icon: '📬', text: 'Open your email inbox' },
              { icon: '🔗', text: 'Click the verification link in the email' },
              { icon: '✅', text: 'Come back & log in to your account' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{step.icon}</span>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{step.text}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Didn't receive the email? Check your spam folder, or try signing up again.
          </p>

          <Link to="/login" className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }}>
            <CheckCircle size={16} /> Go to Login
          </Link>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.3); }
            50% { box-shadow: 0 0 0 12px rgba(124,58,237,0); }
          }
        `}</style>
      </div>
    )
  }

  // 📝 Signup form
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🚀</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join Boostify and get started</p>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              id="signup-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="signup-password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button id="signup-submit" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            <UserPlus size={16} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-divider" style={{ marginTop: 24 }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
