import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'geevinrs@gmail.com'

interface Profile {
  id: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data ?? null)
    setLoading(false)
  }

  async function login(email: string, password: string) {
    // Use backend login endpoint which returns a Supabase session object
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Login failed' }))
      // If the backend tells us the email needs verification, throw a specific error
      if (body?.needsVerification) {
        const err = new Error(body.message || 'Please verify your email.') as any
        err.needsVerification = true
        err.email = email
        throw err
      }
      throw new Error(body.message || 'Login failed')
    }
    const body = await res.json()
    if (!body?.session?.access_token) throw new Error('Login did not return a valid session')

    // Initialize Supabase client with returned session
    await supabase.auth.setSession({ access_token: body.session.access_token, refresh_token: body.session.refresh_token })
  }

  async function register(name: string, email: string, password: string) {
    // Use backend registration endpoint which creates user via admin API
    // (bypasses Supabase confirmation email and sends branded welcome via Gmail)
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Registration failed' }))
      throw new Error(body.message || 'Registration failed')
    }
    const body = await res.json()
    // ✅ Do NOT auto-login — user must verify email first
    return body
  }

  async function resendVerification(email: string) {
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Failed to resend verification email' }))
      throw new Error(body.message || 'Failed to resend verification email')
    }
    const body = await res.json()
    return body
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{
      user, profile, session, login, register, resendVerification, logout,
      isAuthenticated: !!session,
      isAdmin,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
