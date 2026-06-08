export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: 'Active' | 'Inactive'
  lastLogin: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  purchases: number
  status: 'Active' | 'Inactive'
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  quantity: number
  status: 'Active' | 'Discontinued'
}

export interface Sale {
  id: string
  customer: string
  product: string
  amount: number
  date: string
  status: 'Completed' | 'Pending' | 'Cancelled'
}

export interface InventoryItem {
  id: string
  productName: string
  stock: number
  reorderLevel: number
  supplier: string
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

export interface AuditLog {
  id: string
  user: string
  action: string
  timestamp: string
  ip: string
  status: 'Success' | 'Failed'
}

export interface AdminNotification {
  id: string
  title: string
  type: string
  message: string
  read: boolean
  createdAt: string
}

export interface Role {
  id: string
  name: string
  permissions: string
  users: number
}

export const adminKpis = {
  revenue: '$2.4M',
  sales: '48,291',
  customers: '12,491',
  users: '156',
  products: '842',
  orders: '9,204',
  profitLoss: '+$412K',
}

export const recentActivities = [
  { id: '1', text: 'New user registered — Sarah Chen', time: '2 min ago', type: 'user' },
  { id: '2', text: 'Sale completed — $4,200 (Enterprise Plan)', time: '15 min ago', type: 'sale' },
  { id: '3', text: 'Low stock alert — Product SKU-4421', time: '32 min ago', type: 'alert' },
  { id: '4', text: 'Revenue milestone — $2.4M reached', time: '1 hr ago', type: 'revenue' },
  { id: '5', text: 'Report exported — Monthly Sales PDF', time: '2 hr ago', type: 'report' },
]

export const monthlyGrowth = [
  { month: 'Jan', revenue: 180, sales: 3200, customers: 980 },
  { month: 'Feb', revenue: 195, sales: 3450, customers: 1020 },
  { month: 'Mar', revenue: 210, sales: 3680, customers: 1080 },
  { month: 'Apr', revenue: 205, sales: 3520, customers: 1105 },
  { month: 'May', revenue: 228, sales: 3910, customers: 1150 },
  { month: 'Jun', revenue: 240, sales: 4100, customers: 1249 },
]

export const regionalPerformance = [
  { region: 'North', value: 35 },
  { region: 'East', value: 28 },
  { region: 'South', value: 22 },
  { region: 'West', value: 15 },
]

export const productPerformance = [
  { name: 'Analytics Pro', sales: 4200 },
  { name: 'Data Suite', sales: 3800 },
  { name: 'AI Insights', sales: 3100 },
  { name: 'Report Hub', sales: 2700 },
  { name: 'Cloud Sync', sales: 2200 },
]

export const mockUsers: AdminUser[] = [
  { id: 'U001', name: 'Sarah Chen', email: 'sarah@bizanalytics.com', phone: '+1 555-0101', role: 'Super Admin', status: 'Active', lastLogin: '2026-06-08 09:12' },
  { id: 'U002', name: 'James Wilson', email: 'james@bizanalytics.com', phone: '+1 555-0102', role: 'Admin', status: 'Active', lastLogin: '2026-06-08 08:45' },
  { id: 'U003', name: 'Maria Garcia', email: 'maria@bizanalytics.com', phone: '+1 555-0103', role: 'Manager', status: 'Active', lastLogin: '2026-06-07 17:30' },
  { id: 'U004', name: 'David Kim', email: 'david@bizanalytics.com', phone: '+1 555-0104', role: 'Analyst', status: 'Inactive', lastLogin: '2026-06-01 11:00' },
  { id: 'U005', name: 'Emily Brown', email: 'emily@bizanalytics.com', phone: '+1 555-0105', role: 'Manager', status: 'Active', lastLogin: '2026-06-08 07:20' },
]

export const mockCustomers: Customer[] = [
  { id: 'C001', name: 'Acme Corp', email: 'contact@acme.com', phone: '+1 555-2001', address: '123 Business Ave, NY', purchases: 42, status: 'Active' },
  { id: 'C002', name: 'TechFlow Inc', email: 'hello@techflow.io', phone: '+1 555-2002', address: '456 Innovation Dr, SF', purchases: 28, status: 'Active' },
  { id: 'C003', name: 'Global Retail', email: 'sales@globalretail.com', phone: '+1 555-2003', address: '789 Commerce St, TX', purchases: 65, status: 'Active' },
  { id: 'C004', name: 'StartUp Labs', email: 'team@startuplabs.co', phone: '+1 555-2004', address: '321 Startup Blvd, WA', purchases: 12, status: 'Inactive' },
]

export const mockProducts: Product[] = [
  { id: 'P001', name: 'Analytics Pro License', category: 'Software', price: 499, quantity: 120, status: 'Active' },
  { id: 'P002', name: 'Data Connector Pack', category: 'Add-on', price: 149, quantity: 85, status: 'Active' },
  { id: 'P003', name: 'AI Forecasting Module', category: 'AI', price: 299, quantity: 45, status: 'Active' },
  { id: 'P004', name: 'Legacy Report Tool', category: 'Software', price: 99, quantity: 0, status: 'Discontinued' },
]

export const mockSales: Sale[] = [
  { id: 'S001', customer: 'Acme Corp', product: 'Analytics Pro', amount: 4990, date: '2026-06-08', status: 'Completed' },
  { id: 'S002', customer: 'TechFlow Inc', product: 'AI Forecasting', amount: 2990, date: '2026-06-07', status: 'Completed' },
  { id: 'S003', customer: 'Global Retail', product: 'Data Connector', amount: 1490, date: '2026-06-07', status: 'Pending' },
  { id: 'S004', customer: 'StartUp Labs', product: 'Analytics Pro', amount: 499, date: '2026-06-06', status: 'Cancelled' },
]

export const mockInventory: InventoryItem[] = [
  { id: 'I001', productName: 'Analytics Pro License', stock: 120, reorderLevel: 30, supplier: 'BizSoft Ltd', status: 'In Stock' },
  { id: 'I002', productName: 'Data Connector Pack', stock: 18, reorderLevel: 25, supplier: 'DataLink Co', status: 'Low Stock' },
  { id: 'I003', productName: 'AI Forecasting Module', stock: 45, reorderLevel: 20, supplier: 'AI Systems Inc', status: 'In Stock' },
  { id: 'I004', productName: 'Legacy Report Tool', stock: 0, reorderLevel: 10, supplier: 'OldTech Corp', status: 'Out of Stock' },
]

export const mockAuditLogs: AuditLog[] = [
  { id: 'A001', user: 'Sarah Chen', action: 'User login', timestamp: '2026-06-08 09:12:04', ip: '192.168.1.10', status: 'Success' },
  { id: 'A002', user: 'James Wilson', action: 'Updated product P002', timestamp: '2026-06-08 08:55:22', ip: '192.168.1.15', status: 'Success' },
  { id: 'A003', user: 'David Kim', action: 'Failed login attempt', timestamp: '2026-06-08 08:30:11', ip: '10.0.0.44', status: 'Failed' },
  { id: 'A004', user: 'Maria Garcia', action: 'Downloaded sales report', timestamp: '2026-06-07 16:42:00', ip: '192.168.1.22', status: 'Success' },
]

export const mockNotifications: AdminNotification[] = [
  { id: 'N001', title: 'New User Registration', type: 'User', message: 'Emily Brown registered as Manager', read: false, createdAt: '2026-06-08 07:20' },
  { id: 'N002', title: 'New Sale Alert', type: 'Sale', message: 'Sale S001 completed — $4,990', read: false, createdAt: '2026-06-08 09:00' },
  { id: 'N003', title: 'Low Inventory Alert', type: 'Inventory', message: 'Data Connector Pack below reorder level', read: true, createdAt: '2026-06-07 14:30' },
  { id: 'N004', title: 'Revenue Milestone', type: 'Revenue', message: 'Total revenue reached $2.4M', read: true, createdAt: '2026-06-07 10:00' },
]

export const mockRoles: Role[] = [
  { id: 'R001', name: 'Super Admin', permissions: 'Full system access', users: 2 },
  { id: 'R002', name: 'Admin', permissions: 'Users, reports, settings', users: 5 },
  { id: 'R003', name: 'Manager', permissions: 'Sales, customers, inventory', users: 12 },
  { id: 'R004', name: 'Analyst', permissions: 'Read-only analytics & reports', users: 28 },
]
