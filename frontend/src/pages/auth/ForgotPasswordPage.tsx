import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import styles from './Auth.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className={styles.form}>
      <h2 className={styles.title}>Check your email</h2>
      <p className={styles.subtitle}>Password reset instructions sent to <strong>{email}</strong></p>
      <Link to="/auth/login" className={styles.submitBtn} style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem' }}>
        Back to Sign In
      </Link>
    </div>
  )

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Reset password</h2>
      <p className={styles.subtitle}>Enter your email and we'll send reset instructions.</p>
      <form onSubmit={handleSubmit} className={styles.fields}>
        <div className={styles.field}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
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
