import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(name, category)')
    .order('stock_quantity', { ascending: true })
  if (error) { res.status(500).json({ message: error.message }); return }
  const lowStock = data?.filter(i => i.stock_quantity < i.reorder_point) ?? []
  res.json({ items: data ?? [], lowStockCount: lowStock.length, lowStockItems: lowStock })
})

router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { stock_quantity } = req.body
  const { data, error } = await supabase
    .from('inventory').update({ stock_quantity, last_updated: new Date().toISOString() })
    .eq('id', req.params.id).select().single()
  if (error) { res.status(400).json({ message: error.message }); return }
  res.json(data)
})

export default router
