import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('reports').select('*').order('created_at', { ascending: false })
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data)
})

router.post('/generate', authenticate, async (req: AuthRequest, res: Response) => {
  const { name, type = 'PDF' } = req.body
  const { data, error } = await supabase.from('reports')
    .insert({ name, type, status: 'PENDING', generated_by: req.user!.id })
    .select().single()
  if (error) { res.status(400).json({ message: error.message }); return }
  res.status(201).json(data)
})

export default router
