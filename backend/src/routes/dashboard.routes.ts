import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  const [{ data: sales }, { data: customers }, { data: expenses }] = await Promise.all([
    supabase.from('sales').select('total, sale_date'),
    supabase.from('customers').select('id', { count: 'exact' }),
    supabase.from('expenses').select('amount'),
  ])

  const totalRevenue = sales?.reduce((sum, s) => sum + Number(s.total), 0) ?? 0
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0
  const totalCustomers = customers?.length ?? 0

  res.json({
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    totalSales: sales?.length ?? 0,
    totalCustomers,
    profitMargin: totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0,
  })
})

export default router
