import { Router, Response } from 'express'
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'

const router = Router()

// Get notifications for current user (admins may query all)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const q = supabase.from('notifications').select('*').order('created_at', { ascending: false })
  if (req.user?.role !== 'ADMIN') q.eq('user_id', req.user!.id)
  const { data, error } = await q
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data)
})

// Create notification (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { user_id, title, message, type = 'INFO' } = req.body
  const { data, error } = await supabase.from('notifications').insert({ user_id, title, message, type }).select().single()
  if (error) { res.status(400).json({ message: error.message }); return }
  res.status(201).json(data)
})

// Mark read
router.patch('/:id/mark-read', authenticate, async (req: AuthRequest, res: Response) => {
  // owner or admin
  const { data: existing, error: fetchErr } = await supabase.from('notifications').select('*').eq('id', req.params.id).single()
  if (fetchErr || !existing) { res.status(404).json({ message: 'Notification not found' }); return }
  if (existing.user_id !== req.user!.id && req.user!.role !== 'ADMIN') { res.status(403).json({ message: 'Forbidden' }); return }
  const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', req.params.id).select().single()
  if (error) { res.status(400).json({ message: error.message }); return }
  res.json(data)
})

// Delete notification (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { error } = await supabase.from('notifications').delete().eq('id', req.params.id)
  if (error) { res.status(400).json({ message: error.message }); return }
  res.json({ message: 'Deleted' })
})

export default router
