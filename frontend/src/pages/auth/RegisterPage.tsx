import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import styles from './Auth.module.css'

const purposes = [
  'Business Analytics & Reporting',
  'Sales Performance Tracking',
  'Financial Monitoring',
  'Customer Insights',
  'Inventory Management',
  'Marketing Analytics',
  'Executive Dashboard',
  'Other',
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [purpose, setPurpose] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!purpose) { setError('Please select your primary purpose.'); return }
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/auth/login')
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Create account</h2>
      <p className={styles.subtitle}>Start your free BizAnalytics journey</p>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.fields}>
        <div className={styles.field}>
          <label>Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
        </div>
        <div className={styles.field}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div className={styles.field}>
          <label>Primary Purpose</label>
          <select value={purpose} onChange={e => setPurpose(e.target.value)} required className={styles.select}>
            <option value="" disabled>Select your main use case...</option>
            {purposes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required />
        </div>
        <div className={styles.field}>
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            required
            className={confirm && confirm !== password ? styles.inputError : ''}
          />
          {confirm && confirm !== password && (
            <span className={styles.fieldError}>Passwords do not match</span>
          )}
        </div>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className={styles.switchText}>
        Already have an account? <Link to="/auth/login">Sign in</Link>
      </p>
    </div>
  )
}
