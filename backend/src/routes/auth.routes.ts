import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'

const router = Router()

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

router.post('/register', async (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: parsed.error.errors[0].message }); return }
  const { name, email, password } = parsed.data

  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { name },
  })
  if (error) { res.status(400).json({ message: error.message }); return }

  // Create profile
  await supabase.from('profiles').insert({ id: data.user.id, name, role: 'USER' })
  res.status(201).json({ message: 'Account created successfully' })
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) { res.status(400).json({ message: 'Email and password required' }); return }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) { res.status(401).json({ message: 'Invalid email or password' }); return }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
  res.json({ token: data.session.access_token, user: { id: data.user.id, name: profile?.name, email: data.user.email, role: profile?.role ?? 'USER' } })
})

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.user!.id).single()
  if (!profile) { res.status(404).json({ message: 'Profile not found' }); return }
  res.json({ id: req.user!.id, email: req.user!.email, ...profile })
})

router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body
  if (email) await supabase.auth.resetPasswordForEmail(email)
  res.json({ message: 'If that email exists, a reset link has been sent.' })
})

export default router
