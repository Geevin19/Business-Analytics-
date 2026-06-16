import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import styles from './AdminLogin.module.css'

const ADMIN_EMAIL = 'geevinrs@gmail.com'

export default function AdminLoginPage() {
  const { login, isAdmin, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Already logged in as admin — go straight to admin dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) navigate('/admin/dashboard', { replace: true })
  }, [loading, isAuthenticated, isAdmin, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (email.toLowerCase() !== ADMIN_EMAIL) {
      setError('Access denied. This portal is for administrators only.')
      return
    }

    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/admin/dashboard', { replace: true })
    } catch {
      setError('Invalid credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>⚙️</div>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>Restricted access — administrators only</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="username"
            />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className={styles.btn} disabled={submitting}>
            {submitting ? 'Verifying...' : 'Access Admin Panel'}
          </button>
        </form>

        <div className={styles.back}>
          <a href="/auth/login">← Back to User Login</a>
        </div>
      </div>
    </div>
  )
}
