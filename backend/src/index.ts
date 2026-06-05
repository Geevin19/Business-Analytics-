import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import dashboardRoutes from './routes/dashboard.routes'
import salesRoutes from './routes/sales.routes'
import customerRoutes from './routes/customer.routes'
import financeRoutes from './routes/finance.routes'
import inventoryRoutes from './routes/inventory.routes'
import aiRoutes from './routes/ai.routes'
import reportRoutes from './routes/report.routes'
import adminRoutes from './routes/admin.routes'
import { errorHandler } from './middleware/error.middleware'

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:4200'], credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.use(errorHandler)

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
