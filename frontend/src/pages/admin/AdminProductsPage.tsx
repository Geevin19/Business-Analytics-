import { useState } from 'react'
import AdminPageShell from '@/components/admin/AdminPageShell'
import DataTable from '@/components/admin/DataTable'
import { useToast } from '@/components/admin/useToast'
import { mockProducts, Product } from '@/data/adminMockData'
import { Plus } from 'lucide-react'
import s from '@/components/admin/admin.module.css'

export default function AdminProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const { show, Toast } = useToast()

  const columns = [
    { key: 'id', header: 'Product ID' },
    { key: 'name', header: 'Product Name' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price', render: (r: Product) => `$${r.price}` },
    { key: 'quantity', header: 'Quantity' },
    { key: 'status', header: 'Status', render: (r: Product) => (
      <span className={`${s.badge} ${r.status === 'Active' ? s.badgeSuccess : s.badgeMuted}`}>{r.status}</span>
    )},
  ]

  return (
    <AdminPageShell title="Product Management" subtitle="Manage products, categories, pricing and analytics"
      actions={<button className={s.btnPrimary} onClick={() => show('Add product form opened')}><Plus size={15} /> Add Product</button>}>
      <DataTable columns={columns} data={products} searchKeys={['name', 'category', 'id']}
        filters={[
          { key: 'category', label: 'All Categories', options: ['Software', 'Add-on', 'AI'] },
          { key: 'status', label: 'All Status', options: ['Active', 'Discontinued'] },
        ]}
        actions={(row: Product) => (
          <>
            <button className={s.btnIcon} onClick={() => show(`Editing ${row.name}`)}>Edit</button>
            <button className={s.btnDanger} onClick={() => { setProducts(p => p.filter(x => x.id !== row.id)); show('Product deleted') }}>Delete</button>
          </>
        )}
      />
      {Toast}
    </AdminPageShell>
  )
}
