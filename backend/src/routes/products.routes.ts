import { Router, Response } from 'express'
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'

const router = Router()

// List products with inventory info
router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, inventory(stock_quantity)')
    .order('created_at', { ascending: false })

  if (error) { res.status(500).json({ message: error.message }); return }

  const mapped = (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    quantity: p.inventory?.[0]?.stock_quantity ?? 0,
    status: (p.inventory?.[0]?.stock_quantity ?? 0) > 0 ? 'Active' : 'Discontinued',
  }))

  res.json(mapped)
})

// Create product (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, category, price, initialStock = 0 } = req.body
  const { data, error } = await supabase.from('products').insert({ name, category, price }).select().single()
  if (error) { res.status(400).json({ message: error.message }); return }

  // create inventory entry
  try {
    await supabase.from('inventory').insert({ product_id: data.id, stock_quantity: initialStock })
  } catch (e) { /* non-blocking */ }

  res.status(201).json(data)
})

// Update product
router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, category, price } = req.body
  const { data, error } = await supabase.from('products').update({ name, category, price }).eq('id', req.params.id).select().single()
  if (error) { res.status(400).json({ message: error.message }); return }
  res.json(data)
})

// Delete product
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id)
  if (error) { res.status(400).json({ message: error.message }); return }
  res.json({ message: 'Product deleted' })
})

export default router
