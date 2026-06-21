import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import styles from './Auth.module.css'

const ADMIN_EMAIL = 'geevinrs@gmail.com'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMsg = (location.state as any)?.message
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    // Block admin from logging in through user portal
    if (email.toLowerCase() === ADMIN_EMAIL) {
      setError('Admin accounts must use the Admin Portal.')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Welcome back</h2>
      <p className={styles.subtitle}>Sign in to your BizAnalytics account</p>
      {successMsg && <div className={styles.success}>{successMsg}</div>}
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.fields}>
        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="you@example.com"
            required
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
          />
        </div>
        <div className={styles.forgotRow}>
          <Link to="/auth/forgot-password">Forgot password?</Link>
        </div>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className={styles.switchText}>
        Don't have an account? <Link to="/auth/register">Create one</Link>
      </p>
      <p className={styles.switchText} style={{ marginTop: '0.5rem', fontSize: '0.78rem' }}>
        Administrator? <Link to="/admin/login">Admin Portal →</Link>
      </p>
    </div>
  )
}
