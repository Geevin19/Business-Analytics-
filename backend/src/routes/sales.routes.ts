import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('sales')
    .select('*, products(name, category), customers(name, region)')
    .order('sale_date', { ascending: false })
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data)
})

router.get('/summary', authenticate, async (_req: AuthRequest, res: Response) => {
  const { data } = await supabase.from('sales').select('total, sale_date, region')
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const monthStart = new Date().toISOString().slice(0, 7) + '-01'

  res.json({
    today: data?.filter(s => s.sale_date === today).reduce((sum, s) => sum + Number(s.total), 0) ?? 0,
    thisWeek: data?.filter(s => s.sale_date >= weekAgo).reduce((sum, s) => sum + Number(s.total), 0) ?? 0,
    thisMonth: data?.filter(s => s.sale_date >= monthStart).reduce((sum, s) => sum + Number(s.total), 0) ?? 0,
    total: data?.reduce((sum, s) => sum + Number(s.total), 0) ?? 0,
    byRegion: ['North', 'South', 'East', 'West'].map(r => ({
      name: r, value: data?.filter(s => s.region === r).reduce((sum, s) => sum + Number(s.total), 0) ?? 0
    })),
  })
})

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { product_id, customer_id, quantity, unit_price, region, sale_date } = req.body
  const { data, error } = await supabase.from('sales').insert({ product_id, customer_id, quantity, unit_price, region, sale_date }).select().single()
  if (error) { res.status(400).json({ message: error.message }); return }
  res.status(201).json(data)
})

export default router
