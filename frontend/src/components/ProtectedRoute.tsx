import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc' }}>
      <div style={{ textAlign: 'center', color: '#166D16' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Loading...</div>
      </div>
    </div>
  )

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />
}
