import { useState, useEffect } from 'react'
import AdminPageShell from '@/components/admin/AdminPageShell'
import DataTable from '@/components/admin/DataTable'
import { useToast } from '@/components/admin/useToast'
import { InventoryItem } from '@/data/adminMockData'
import { getInventory, updateInventoryItem } from '@/services/admin.service'
import { Plus, AlertTriangle } from 'lucide-react'
import s from '@/components/admin/admin.module.css'

const statusClass: Record<string, string> = {
  'In Stock': s.badgeSuccess,
  'Low Stock': s.badgeWarning,
  'Out of Stock': s.badgeDanger,
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const { show, Toast } = useToast()
  useEffect(() => { let mounted = true; getInventory().then(d => { if (mounted) setItems(d.items ?? []) }).catch(() => {}); return () => { mounted = false } }, [])
  const lowStock = items.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock')

  const columns = [
    { key: 'id', header: 'Item ID' },
    { key: 'productName', header: 'Product' },
    { key: 'stock', header: 'Stock Qty' },
    { key: 'reorderLevel', header: 'Reorder Level' },
    { key: 'supplier', header: 'Supplier' },
    { key: 'status', header: 'Status', render: (r: InventoryItem) => (
      <span className={`${s.badge} ${statusClass[r.status]}`}>{r.status}</span>
    )},
  ]

  return (
    <AdminPageShell title="Inventory Management" subtitle="Stock levels, reorder alerts and supplier tracking"
      actions={<button className={s.btnPrimary} onClick={() => show('Add inventory item')}><Plus size={15} /> Add Item</button>}>
      {lowStock.length > 0 && (
        <div className={s.card} style={{ borderColor: '#f59e0b', background: 'rgba(245,158,11,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', fontWeight: 600, fontSize: '0.875rem' }}>
            <AlertTriangle size={16} /> Low Stock Alerts: {lowStock.map(i => i.productName).join(', ')}
          </div>
        </div>
      )}
      <DataTable columns={columns} data={items} searchKeys={['productName', 'supplier', 'id']}
        filters={[{ key: 'status', label: 'All Status', options: ['In Stock', 'Low Stock', 'Out of Stock'] }]}
        actions={(row: InventoryItem) => (
          <>
            <button className={s.btnIcon} onClick={async () => {
              const val = window.prompt(`New stock for ${row.productName}`, String((row as any).stock ?? 0))
              if (!val) return
              const num = Number(val)
              if (Number.isNaN(num)) { show('Invalid number'); return }
              try {
                const updated = await updateInventoryItem(row.id, { stock_quantity: num })
                setItems(prev => prev.map(it => it.id === row.id ? { ...it, stock: updated.stock_quantity ?? num, status: (updated.stock_quantity ?? num) > 0 ? 'In Stock' : 'Out of Stock' } : it))
                show('Stock updated')
              } catch (e) { show('Failed to update stock') }
            }}>Update Stock</button>
            <button className={s.btnDanger} onClick={() => { setItems(i => i.filter(x => x.id !== row.id)); show('Item removed') }}>Delete</button>
          </>
        )}
      />
      {Toast}
    </AdminPageShell>
  )
}
