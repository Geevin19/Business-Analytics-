import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data)
})

router.get('/summary', authenticate, async (_req: AuthRequest, res: Response) => {
  const { data } = await supabase.from('customers').select('segment, created_at')
  const monthStart = new Date().toISOString().slice(0, 7) + '-01'
  res.json({
    total: data?.length ?? 0,
    newThisMonth: data?.filter(c => c.created_at >= monthStart).length ?? 0,
    bySegment: ['Premium', 'Regular', 'New', 'Churned'].map(s => ({
      name: s, value: data?.filter(c => c.segment === s).length ?? 0
    })),
  })
})

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { name, email, phone, region, segment } = req.body
  const { data, error } = await supabase.from('customers').insert({ name, email, phone, region, segment }).select().single()
  if (error) { res.status(400).json({ message: error.message }); return }
  res.status(201).json(data)
})

export default router
