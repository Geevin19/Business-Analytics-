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
  const [verificationLink, setVerificationLink] = useState<string | null>(null)
  const [copyText, setCopyText] = useState('Copy')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setVerificationLink(null)
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!purpose) { setError('Please select your primary purpose.'); return }
    setLoading(true)
    try {
      const result = await register(name, email, password) as any
      if (result?.verificationLink) {
        // Email may not have been sent, so show the link directly
        setVerificationLink(result.verificationLink)
      } else {
        navigate('/auth/login', {
          state: {
            message: 'Account created successfully! Please check your email to verify your account before logging in.',
          },
        })
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopyLink() {
    if (verificationLink) {
      try {
        await navigator.clipboard.writeText(verificationLink)
        setCopyText('Copied!')
        setTimeout(() => setCopyText('Copy'), 3000)
      } catch {
        // Fallback copy
        const textarea = document.createElement('textarea')
        textarea.value = verificationLink
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setCopyText('Copied!')
        setTimeout(() => setCopyText('Copy'), 3000)
      }
    }
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Create account</h2>
      <p className={styles.subtitle}>Start your free BizAnalytics journey</p>
      {error && <div className={styles.error}>{error}</div>}
      {verificationLink && (
        <div className={styles.success} style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', lineHeight: '1.5' }}>
            ⚠️ The verification email could not be delivered. You can verify your account directly by clicking the button below:
          </p>
          <a
            href={verificationLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.submitBtn}
            style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center', marginBottom: '8px' }}
          >
            Verify My Email Now
          </a>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              type="text"
              value={verificationLink}
              readOnly
              style={{
                flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid #2d3748',
                borderRadius: '6px', padding: '6px 8px', color: '#94a3b8', fontSize: '11px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleCopyLink}
              style={{
                background: '#2d3748', border: 'none', borderRadius: '6px',
                padding: '6px 10px', color: '#f1f5f9', cursor: 'pointer', fontSize: '11px',
                whiteSpace: 'nowrap',
              }}
            >
              {copyText}
            </button>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'rgba(241,245,249,0.4)' }}>
            After verifying, you can <Link to="/auth/login" style={{ color: '#818cf8' }}>Sign in</Link>
          </p>
        </div>
      )}
      {!verificationLink && (
        <>
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
        </>
      )}
    </div>
  )
}