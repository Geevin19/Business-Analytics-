import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import styles from './Auth.module.css'

const ADMIN_EMAIL = 'geevinrs@gmail.com'

export default function LoginPage() {
  const { login, resendVerification } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMsg = (location.state as any)?.message
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const [resendLink, setResendLink] = useState<string | null>(null)
  const [copyText, setCopyText] = useState('Copy')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setNeedsVerification(false)
    setResendMsg('')

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
      if (err.needsVerification) {
        setNeedsVerification(true)
        setVerifyEmail(err.email || email)
        setError(err.message)
      } else {
        setError(err.message || 'Invalid email or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setResendMsg('')
    setResendLink(null)
    try {
      const result = await resendVerification(verifyEmail) as any
      if (result?.verificationLink) {
        setResendLink(result.verificationLink)
        setResendMsg('⚠️ The verification email could not be delivered. Use the link below to verify directly.')
      } else {
        setResendMsg('Verification email resent! Please check your inbox.')
      }
    } catch {
      setResendMsg('Failed to resend. Please try again later.')
    } finally {
      setResending(false)
    }
  }

  async function handleCopyLink() {
    if (resendLink) {
      try {
        await navigator.clipboard.writeText(resendLink)
        setCopyText('Copied!')
        setTimeout(() => setCopyText('Copy'), 3000)
      } catch {
        const textarea = document.createElement('textarea')
        textarea.value = resendLink
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
      <h2 className={styles.title}>Welcome back</h2>
      <p className={styles.subtitle}>Sign in to your BizAnalytics account</p>
      {successMsg && <div className={styles.success}>{successMsg}</div>}
      {error && <div className={styles.error}>{error}</div>}
      {resendMsg && <div className={resendMsg.includes('resent') ? styles.success : styles.error}>{resendMsg}</div>}
      {resendLink && (
        <div className={styles.success} style={{ marginBottom: '1rem' }}>
          <a
            href={resendLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.submitBtn}
            style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginBottom: '8px' }}
          >
            Verify My Email Now
          </a>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              type="text"
              value={resendLink}
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
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.fields}>
        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setNeedsVerification(false); setResendMsg('') }}
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
      {needsVerification && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            onClick={handleResend}
            disabled={resending}
            className={styles.linkBtn}
          >
            {resending ? 'Sending...' : 'Resend verification email'}
          </button>
        </div>
      )}
      <p className={styles.switchText}>
        Don't have an account? <Link to="/auth/register">Create one</Link>
      </p>
      <p className={styles.switchText} style={{ marginTop: '0.5rem', fontSize: '0.78rem' }}>
        Administrator? <Link to="/admin/login">Admin Portal →</Link>
      </p>
    </div>
  )
}
