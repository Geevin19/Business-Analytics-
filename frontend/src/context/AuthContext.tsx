import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Profile {
  name: string
  role: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ verificationLink?: string } | void>
  logout: () => Promise<void>
  resendVerification: (email: string) => Promise<{ verificationLink?: string } | void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const ADMIN_EMAIL = 'geevinrs@gmail.com'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user
  const isAdmin = user?.email === ADMIN_EMAIL

  // Fetch profile from the profiles table
  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data as Profile | null)
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Check if error is due to email not confirmed
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        throw { message: 'Please verify your email before signing in.', needsVerification: true, email }
      }
      throw { message: error.message }
    }
    if (data.user) {
      await fetchProfile(data.user.id)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    })
    if (error) throw { message: error.message }

    const result: { verificationLink?: string } = {}
    if (data?.user?.identities?.length === 0) {
      throw { message: 'An account with this email already exists.' }
    }

    // Check if user needs manual verification (no email sent in dev)
    if (data?.user?.confirmation_sent_at && !data?.session) {
      result.verificationLink = `${window.location.origin}/auth/login`
    }

    return result
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const resendVerification = async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    })
    if (error) throw { message: error.message }

    // If no email was sent (development mode), provide a direct link
    if (!data?.user) {
      return { verificationLink: `${window.location.origin}/auth/login` }
    }
  }

  return (
    <AuthContext.Provider value={{
      user, profile, isAuthenticated, isAdmin, loading,
      login, register, logout, resendVerification,
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