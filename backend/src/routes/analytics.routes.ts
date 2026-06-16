import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { supabase } from '../lib/supabase'

const router = Router()

// Returns analytics overview used by admin dashboard and analytics pages
router.get('/overview', authenticate, async (_req: AuthRequest, res: Response) => {
  const now = new Date()
  const months = 6
  const monthKeys: string[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthKeys.push(d.toLocaleString('en-US', { month: 'short' }))
  }

  const [{ data: sales }, { data: customers }, { data: products }] = await Promise.all([
    supabase.from('sales').select('total, sale_date, region, product_id'),
    supabase.from('customers').select('id, created_at'),
    supabase.from('products').select('id, name'),
  ])

  const monthlyGrowth = monthKeys.map((m, idx) => {
    const monthIndex = new Date(now.getFullYear(), now.getMonth() - (months - 1 - idx), 1)
    const start = new Date(monthIndex.getFullYear(), monthIndex.getMonth(), 1)
    const end = new Date(monthIndex.getFullYear(), monthIndex.getMonth() + 1, 1)
    const rev = (sales ?? []).filter((s: any) => {
      const d = new Date(s.sale_date)
      return d >= start && d < end
    }).reduce((sum: number, s: any) => sum + Number(s.total ?? 0), 0)
    const saleCount = (sales ?? []).filter((s: any) => {
      const d = new Date(s.sale_date)
      return d >= start && d < end
    }).length
    const custCount = (customers ?? []).filter((c: any) => {
      const d = new Date(c.created_at)
      return d >= start && d < end
    }).length
    return { month: m, revenue: Math.round(rev / 1000), sales: saleCount, customers: custCount }
  })

  const regionalPerformance = ['North', 'East', 'South', 'West'].map(r => ({
    region: r,
    value: (sales ?? []).filter((s: any) => s.region === r).reduce((sum: number, s: any) => sum + Number(s.total ?? 0), 0)
  }))

  // product performance: top 5 by total sales amount
  const prodMap: Record<string, number> = {}
  (sales ?? []).forEach((s: any) => { if (s.product_id) prodMap[s.product_id] = (prodMap[s.product_id] || 0) + Number(s.total ?? 0) })
  const productPerformance = (products ?? []).map((p: any) => ({ name: p.name, sales: prodMap[p.id] ?? 0 })).sort((a: any, b: any) => b.sales - a.sales).slice(0, 10)

  const recentActivities = (await supabase.from('audit_logs').select('user_email, action, created_at').order('created_at', { ascending: false }).limit(10)).data || []

  res.json({ monthlyGrowth, regionalPerformance, productPerformance, recentActivities })
})

export default router
