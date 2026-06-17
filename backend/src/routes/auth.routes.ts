import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendLoginAlertEmail,
} from '../services/email.service'

const router = Router()

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

// ── Register ──────────────────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: parsed.error.errors[0].message }); return }
  const { name, email, password } = parsed.data

  // Create the user WITHOUT auto-confirming — user must verify email first
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,          // 🔒 require email verification
    user_metadata: { name },
  })
  if (error) { res.status(400).json({ message: error.message }); return }

  // create profile (user exists but email not yet confirmed)
  await supabase.from('profiles').insert({ id: data.user.id, name, role: 'USER' })

  // Generate a verification link via Supabase admin API
  let verificationLink: string | null = null
  try {
    const { data: linkData, error: linkError } = await (supabase.auth.admin.generateLink as any)({
      type: 'signup',
      email,
    })
    if (!linkError && linkData?.properties?.action_link) {
      verificationLink = linkData.properties.action_link
    }
  } catch (e) {
    console.error('Failed to generate verification link:', e)
  }

  // Send a branded welcome email with verification link
  try {
    await sendWelcomeEmail(email, name, verificationLink)
  } catch (e) {
    console.error('Welcome email error:', e)
  }

  // insert welcome notification
  await supabase.from('notifications').insert({
    user_id: data.user.id,
    title: 'Welcome to BizAnalytics!',
    message: `Hi ${name}, please check your email to verify your account before logging in.`,
    type: 'SUCCESS',
  })

  // ✅ Do NOT auto-login — user must verify email first
  // Return the verification link as a fallback in case email delivery fails
  res.status(201).json({
    message: 'Account created successfully! Please check your email to verify your account before logging in.',
    verificationLink: verificationLink || undefined,
  })
})

// ── Login ─────────────────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) { res.status(400).json({ message: 'Email and password required' }); return }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    console.error('Login error:', error)
    const msg = error?.message ?? 'Invalid email or password'
    res.status(401).json({ message: msg })
    return
  }

  // 🔒 Block login if email is not verified
  if (!data.user.email_confirmed_at) {
    res.status(403).json({
      message: 'Please verify your email before logging in. Check your inbox for the verification link.',
      needsVerification: true,
    })
    return
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()

  // send login alert email (non-blocking)
  try { await sendLoginAlertEmail(email, profile?.name ?? 'there') } catch (e) { console.error('Email error:', e) }

  // return full session so client can set Supabase client session
  res.json({
    session: data.session,
    user: { id: data.user.id, name: profile?.name, email: data.user.email, role: profile?.role ?? 'USER' },
  })
})

// ── Resend verification email ─────────────────────────────────────────────
router.post('/resend-verification', async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) { res.status(400).json({ message: 'Email required' }); return }

  try {
    // Generate a new verification link
    const { data: linkData, error: linkError } = await (supabase.auth.admin.generateLink as any)({
      type: 'signup',
      email,
    })
    if (!linkError && linkData?.properties?.action_link) {
      // Send verification email
      await sendWelcomeEmail(email, linkData.properties?.name ?? 'there', linkData.properties.action_link)
      res.json({
        message: 'Verification email resent. Please check your inbox.',
        verificationLink: linkData.properties.action_link,
      })
    } else {
      res.status(400).json({ message: 'Could not send verification email. Please try again.' })
    }
  } catch (e) {
    console.error('Verification email error:', e)
    res.status(500).json({ message: 'Failed to send verification email.' })
  }
})

// ── Me ────────────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.user!.id).single()
  if (!profile) { res.status(404).json({ message: 'Profile not found' }); return }
  res.json({ id: req.user!.id, email: req.user!.email, ...profile })
})

// ── Forgot password ───────────────────────────────────────────────────────
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) { res.status(400).json({ message: 'Email required' }); return }

  try {
    // Generate a password reset link via Supabase admin API (no email sent)
    const { data: linkData, error: linkError } = await (supabase.auth.admin.generateLink as any)({
      type: 'recovery',
      email,
    })
    if (!linkError && linkData?.properties?.action_link) {
      // Send the branded reset email ourselves via Gmail app password
      await sendPasswordResetEmail(email, linkData.properties.action_link)
    } else {
      // Fallback: send generic link
      const fallbackLink = `http://localhost:3000/auth/reset-password`
      await sendPasswordResetEmail(email, fallbackLink)
    }
  } catch (e) {
    console.error('Reset email error:', e)
  }

  // always respond OK (security: don't reveal if email exists)
  res.json({ message: 'If that email exists, a reset link has been sent.' })
})

export default router