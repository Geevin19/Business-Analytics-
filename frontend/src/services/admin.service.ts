import api from './api'

export async function getAdminUsers() {
  const res = await api.get('/admin/users')
  return res.data
}

export async function updateUserRole(id: string, role: string) {
  const res = await api.patch(`/admin/users/${id}/role`, { role })
  return res.data
}

export async function getAuditLogs() {
  const res = await api.get('/admin/audit-logs')
  return res.data
}

export async function getSystemStatus() {
  const res = await api.get('/admin/system')
  return res.data
}

export async function getCustomers() {
  const res = await api.get('/customers')
  return res.data
}

export async function getInventory() {
  const res = await api.get('/inventory')
  return res.data
}

export async function getSales() {
  const res = await api.get('/sales')
  return res.data
}

export async function getProducts() {
  const res = await api.get('/products')
  return res.data
}

export async function getNotifications() {
  const res = await api.get('/notifications')
  return res.data
}

export async function markNotificationRead(id: string) {
  const res = await api.patch(`/notifications/${id}/mark-read`)
  return res.data
}

export async function createNotification(payload: { user_id: string; title: string; message: string; type?: string }) {
  const res = await api.post('/notifications', payload)
  return res.data
}

export async function createProduct(payload: { name: string; category?: string; price?: number; initialStock?: number }) {
  const res = await api.post('/products', payload)
  return res.data
}

export async function updateProduct(id: string, payload: { name?: string; category?: string; price?: number }) {
  const res = await api.patch(`/products/${id}`, payload)
  return res.data
}

export async function deleteProduct(id: string) {
  const res = await api.delete(`/products/${id}`)
  return res.data
}

export async function updateInventoryItem(id: string, payload: { stock_quantity: number }) {
  const res = await api.patch(`/inventory/${id}`, payload)
  return res.data
}

export async function getAnalyticsOverview() {
  const res = await api.get('/analytics/overview')
  return res.data
}

export async function getDashboard() {
  const res = await api.get('/dashboard')
  return res.data
}
