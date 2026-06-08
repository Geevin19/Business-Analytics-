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

  const { data, error } = await supabase.auth.admin.createUser({
    email, password,
    email_confirm: true,
    user_metadata: { name },
  })
  if (error) { res.status(400).json({ message: error.message }); return }

  // create profile
  await supabase.from('profiles').insert({ id: data.user.id, name, role: 'USER' })

  // send welcome email via Gmail
  try { await sendWelcomeEmail(email, name) } catch (e) { console.error('Email error:', e) }

  // insert welcome notification
  await supabase.from('notifications').insert({
    user_id: data.user.id,
    title: 'Welcome to BizAnalytics!',
    message: `Hi ${name}, your account is ready. Explore your dashboard and start making data-driven decisions.`,
    type: 'SUCCESS',
  })

  res.status(201).json({ message: 'Account created successfully' })
})

// ── Login ─────────────────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) { res.status(400).json({ message: 'Email and password required' }); return }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) { res.status(401).json({ message: 'Invalid email or password' }); return }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()

  // send login alert email (non-blocking)
  try { await sendLoginAlertEmail(email, profile?.name ?? 'there') } catch (e) { console.error('Email error:', e) }

  res.json({
    token: data.session.access_token,
    user: { id: data.user.id, name: profile?.name, email: data.user.email, role: profile?.role ?? 'USER' },
  })
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

  const resetLink = `http://localhost:3000/auth/reset-password`

  try {
    // also trigger Supabase reset (puts token in URL)
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: resetLink })
    // send our branded email
    await sendPasswordResetEmail(email, resetLink)
  } catch (e) {
    console.error('Reset email error:', e)
  }

  // always respond OK (security: don't reveal if email exists)
  res.json({ message: 'If that email exists, a reset link has been sent.' })
})

export default router
