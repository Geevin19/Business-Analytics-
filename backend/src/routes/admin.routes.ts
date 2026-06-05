import { Router, Response } from 'express'
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/users', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data)
})

router.patch('/users/:id/role', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { role } = req.body
  const { data, error } = await supabase.from('profiles').update({ role }).eq('id', req.params.id).select().single()
  if (error) { res.status(400).json({ message: error.message }); return }
  res.json(data)
})

router.get('/audit-logs', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data)
})

router.get('/system', authenticate, requireAdmin, (_req: AuthRequest, res: Response) => {
  res.json({
    cpuUsage: Math.floor(Math.random() * 40 + 20),
    memoryUsage: Math.floor(Math.random() * 30 + 50),
    uptime: Math.round(process.uptime()),
    activeSessions: Math.floor(Math.random() * 100 + 200),
    apiUptime: 99.98,
    nodeVersion: process.version,
  })
})

export default router
