import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import styles from './Auth.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className={styles.form}>
      <div className={styles.successIcon}>✉️</div>
      <h2 className={styles.title}>Check your inbox</h2>
      <p className={styles.subtitle}>
        We sent a password reset link to <strong style={{ color: '#6abf6a' }}>{email}</strong> from <strong style={{ color: '#6abf6a' }}>BizAnalytics</strong>.
        <br /><br />Check your spam folder if you don't see it.
      </p>
      <Link to="/auth/login" className={styles.submitBtn} style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', textDecoration: 'none' }}>
        Back to Sign In
      </Link>
    </div>
  )

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Reset password</h2>
      <p className={styles.subtitle}>Enter your email and BizAnalytics will send you a reset link.</p>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.fields}>
        <div className={styles.field}>
          <label>Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <p className={styles.switchText}>
        <Link to="/auth/login">← Back to Sign In</Link>
      </p>
    </div>
  )
}
