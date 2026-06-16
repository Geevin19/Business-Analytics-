import { useState, useEffect } from 'react'
import AdminPageShell from '@/components/admin/AdminPageShell'
import DataTable from '@/components/admin/DataTable'
import { useToast } from '@/components/admin/useToast'
import { Product } from '@/data/adminMockData'
import { getProducts, deleteProduct, createProduct, updateProduct } from '@/services/admin.service'
import { Plus } from 'lucide-react'
import s from '@/components/admin/admin.module.css'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => { let mounted = true; getProducts().then(d => { if (mounted) setProducts(d) }).catch(() => {}); return () => { mounted = false } }, [])
  const { show, Toast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

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

  async function handleDelete(id: string) {
    try {
      await deleteProduct(id)
      setProducts(p => p.filter(x => x.id !== id))
      show('Product deleted')
    } catch (e) { show('Unable to delete product') }
  }

  async function saveProduct(form: { name: string; category?: string; price?: number }) {
    try {
      if (editing) {
        const updated = await updateProduct(editing.id, form)
        setProducts(p => p.map(x => x.id === editing.id ? { ...x, ...updated } : x))
        show('Product updated')
      } else {
        const created = await createProduct({ ...form, initialStock: 0 })
        setProducts(p => [created, ...p])
        show('Product created')
      }
      setModalOpen(false)
      setEditing(null)
    } catch (e) { show('Save failed') }
  }

  return (
    <AdminPageShell title="Product Management" subtitle="Manage products, categories, pricing and analytics"
      actions={<button className={s.btnPrimary} onClick={() => { setEditing(null); setModalOpen(true) }}><Plus size={15} /> Add Product</button>}>
      <DataTable columns={columns} data={products} searchKeys={['name', 'category', 'id']}
        filters={[
          { key: 'category', label: 'All Categories', options: ['Software', 'Add-on', 'AI'] },
          { key: 'status', label: 'All Status', options: ['Active', 'Discontinued'] },
        ]}
        actions={(row: Product) => (
          <>
            <button className={s.btnIcon} onClick={() => { setEditing(row); setModalOpen(true) }}>Edit</button>
            <button className={s.btnDanger} onClick={() => handleDelete(row.id)}>Delete</button>
          </>
        )}
      />
      {modalOpen && (
        <div className={s.modalOverlay} onClick={() => { setModalOpen(false); setEditing(null) }}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>{editing ? 'Edit Product' : 'Add Product'}</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}><label className={s.formLabel}>Name</label><input id="prod_name" className={s.formInput} defaultValue={editing?.name} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Category</label><input id="prod_cat" className={s.formInput} defaultValue={editing?.category} /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Price</label><input id="prod_price" className={s.formInput} type="number" defaultValue={editing?.price} /></div>
            </div>
            <div className={s.modalActions}>
              <button className={s.btnSecondary} onClick={() => { setModalOpen(false); setEditing(null) }}>Cancel</button>
              <button className={s.btnPrimary} onClick={() => {
                const name = (document.getElementById('prod_name') as HTMLInputElement).value
                const category = (document.getElementById('prod_cat') as HTMLInputElement).value
                const price = Number((document.getElementById('prod_price') as HTMLInputElement).value || 0)
                saveProduct({ name, category, price })
              }}>{editing ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
      {Toast}
    </AdminPageShell>
  )
}
