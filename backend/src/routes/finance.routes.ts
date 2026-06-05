import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const [{ data: sales }, { data: expenses }, { data: budgets }] = await Promise.all([
    supabase.from('sales').select('total'),
    supabase.from('expenses').select('amount, category, expense_date'),
    supabase.from('budgets').select('*'),
  ])
  const totalRevenue = sales?.reduce((s, r) => s + Number(r.total), 0) ?? 0
  const totalExpenses = expenses?.reduce((s, r) => s + Number(r.amount), 0) ?? 0
  res.json({ totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses, budgets: budgets ?? [], recentExpenses: expenses?.slice(0, 20) ?? [] })
})

router.post('/expenses', authenticate, async (req: AuthRequest, res: Response) => {
  const { category, description, amount, expense_date } = req.body
  const { data, error } = await supabase.from('expenses').insert({ category, description, amount, expense_date }).select().single()
  if (error) { res.status(400).json({ message: error.message }); return }
  res.status(201).json(data)
})

export default router
