import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Verifying access...</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/admin" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
