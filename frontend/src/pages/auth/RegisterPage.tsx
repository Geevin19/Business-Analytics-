import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import styles from './Auth.module.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/auth/login')
    } catch {
      setError('Registration failed. Please try again.')
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
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required />
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
