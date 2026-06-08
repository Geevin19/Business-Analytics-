import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import styles from './Auth.module.css'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase puts the token in the URL hash — listen for the session
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      navigate('/auth/login', { state: { message: 'Password updated successfully. Please sign in.' } })
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!ready) return (
    <div className={styles.form}>
      <h2 className={styles.title}>Verifying link...</h2>
      <p className={styles.subtitle}>Please wait while we verify your reset link.</p>
    </div>
  )

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Set new password</h2>
      <p className={styles.subtitle}>Enter your new BizAnalytics password below.</p>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.fields}>
        <div className={styles.field}>
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
          />
        </div>
        <div className={styles.field}>
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Re-enter new password"
            required
            className={confirm && confirm !== password ? styles.inputError : ''}
          />
          {confirm && confirm !== password && (
            <span className={styles.fieldError}>Passwords do not match</span>
          )}
        </div>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Updating password...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
