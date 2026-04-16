import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, LogOut, Package, LayoutDashboard, Users, X, LifeBuoy, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  async function handleSignOut() {
    setMenuOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Bosstify" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Products</Link>
          <Link to="/followers" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={15} /> Bosst Follower
          </Link>
          {user ? (
            <>
              <Link to="/orders" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Package size={15} /> My Orders
              </Link>
              <Link to="/support" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LifeBuoy size={15} /> Support
              </Link>
              {isAdmin && (
                <Link to="/admin/dashboard" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a855f7' }}>
                  <LayoutDashboard size={15} /> Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                <ShoppingBag size={14} /> Get Started
              </Link>
            </>
          )}
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile backdrop */}
      <div
        className={`mobile-nav-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile nav drawer */}
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        {/* Close button */}
        <button
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', cursor: 'pointer'
          }}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        <span style={{
          position: 'absolute', top: 20, left: 20,
          display: 'flex', alignItems: 'center'
        }}>
          <img src="/logo.png" alt="Bosstify" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
        </span>

        <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
          <ShoppingBag size={18} /> Products
        </Link>
        <Link to="/followers" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
          <Users size={18} /> Bosst Follower
        </Link>

        {user ? (
          <>
            <Link to="/orders" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              <Package size={18} /> My Orders
            </Link>
            <Link to="/support" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              <LifeBuoy size={18} /> Support
            </Link>
            {isAdmin && (
              <>
                <div className="mobile-nav-divider" />
                <Link
                  to="/admin/dashboard"
                  className="mobile-nav-link"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: '#a855f7' }}
                >
                  <LayoutDashboard size={18} /> Admin Panel
                </Link>
              </>
            )}
            <div className="mobile-nav-divider" />
            <div className="mobile-nav-footer">
              <button
                onClick={handleSignOut}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mobile-nav-divider" />
            <div className="mobile-nav-footer">
              <Link to="/login" className="btn btn-secondary" style={{ textAlign: 'center', width: '100%' }} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary" style={{ textAlign: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => setMenuOpen(false)}>
                <ShoppingBag size={16} /> Get Started
              </Link>
            </div>
          </>
        )}
        {/* Legal links — always shown at bottom of mobile menu */}
        <div className="mobile-nav-divider" />
        <Link to="/privacy-policy" className="mobile-nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <FileText size={16} /> Privacy Policy
        </Link>
        <Link to="/terms" className="mobile-nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <FileText size={16} /> Terms & Conditions
        </Link>
      </nav>
    </>
  )
}
