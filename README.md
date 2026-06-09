# BizAnalytics — Business Intelligence Platform

A full-stack business analytics dashboard with React + TypeScript frontend, Express + TypeScript backend, Supabase as the database and auth provider, and Gmail for transactional emails.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Routing | React Router v6 |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Email | Nodemailer + Gmail SMTP |
| HTTP Client | Axios |

---

## Project Structure

```
Business-Analytics/
├── frontend/                       # React + Vite app
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── src/
│       ├── main.tsx                # Entry point
│       ├── App.tsx                 # Routes definition
│       ├── index.css               # Global CSS variables (dark theme)
│       ├── vite-env.d.ts
│       │
│       ├── lib/
│       │   └── supabase.ts         # Supabase client (anon key)
│       │
│       ├── services/
│       │   └── api.ts              # Axios instance with auth interceptor
│       │
│       ├── context/
│       │   ├── AuthContext.tsx     # Supabase auth state + login/register/logout
│       │   ├── ThemeContext.tsx    # Dark mode (locked to dark)
│       │   └── NotificationContext.tsx  # Real-time notifications via Supabase
│       │
│       ├── components/
│       │   ├── ProtectedRoute.tsx  # Auth guard wrapper
│       │   ├── layout/
│       │   │   ├── Navbar.tsx      # Top bar with notification bell
│       │   │   ├── Navbar.module.css
│       │   │   ├── Sidebar.tsx     # Collapsible nav sidebar
│       │   │   ├── Sidebar.module.css
│       │   │   ├── NotificationBell.tsx   # Dropdown with live notifications
│       │   │   └── NotificationBell.module.css
│       │   └── ui/
│       │       ├── StatCard.tsx    # KPI metric card
│       │       ├── StatCard.module.css
│       │       ├── PageShell.tsx   # Page wrapper with title/subtitle/actions
│       │       └── PageShell.module.css
│       │
│       ├── layouts/
│       │   ├── AppLayout.tsx       # Authenticated shell (sidebar + navbar)
│       │   ├── AppLayout.module.css
│       │   ├── AuthLayout.tsx      # Auth pages shell with animated background
│       │   └── AuthLayout.module.css
│       │
│       └── pages/
│           ├── LandingPage.tsx     # Public landing page (animated cube background)
│           ├── LandingPage.module.css
│           ├── NotificationsPage.tsx
│           ├── ProfilePage.tsx
│           ├── SettingsPage.tsx
│           │
│           ├── auth/
│           │   ├── LoginPage.tsx
│           │   ├── RegisterPage.tsx       # With confirm password + purpose field
│           │   ├── ForgotPasswordPage.tsx
│           │   ├── ResetPasswordPage.tsx  # Handles Supabase PASSWORD_RECOVERY
│           │   └── Auth.module.css
│           │
│           ├── dashboard/
│           │   ├── DashboardPage.tsx      # KPIs, area chart, pie chart, bar chart
│           │   └── DashboardPage.module.css
│           │
│           ├── analytics/
│           │   ├── SalesPage.tsx          # Bar + line charts, daily/monthly stats
│           │   ├── CustomersPage.tsx      # Growth line chart, segmentation pie
│           │   ├── FinancePage.tsx        # Cash flow area chart
│           │   └── InventoryPage.tsx      # Stock levels, low stock alerts
│           │
│           ├── ai/
│           │   ├── ForecastingPage.tsx    # Revenue forecast line chart
│           │   ├── TrendsPage.tsx         # Device usage area chart + AI insights
│           │   └── RecommendationsPage.tsx
│           │
│           ├── reports/
│           │   └── ReportsPage.tsx        # Report list with PDF/Excel actions
│           │
│           └── admin/
│               ├── AdminUsersPage.tsx     # Live user list from Supabase
│               ├── AdminAuditPage.tsx     # Audit logs from Supabase
│               └── AdminMonitorPage.tsx  # CPU/memory live charts
│
├── backend/                        # Express + TypeScript API
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                        # Secrets (gitignored)
│   └── src/
│       ├── index.ts                # Express app + route mounting
│       │
│       ├── lib/
│       │   └── supabase.ts         # Supabase client (service role key)
│       │
│       ├── middleware/
│       │   ├── auth.middleware.ts  # JWT verify via supabase.auth.getUser()
│       │   └── error.middleware.ts # Global error handler
│       │
│       ├── routes/
│       │   ├── auth.routes.ts      # /api/auth — register, login, me, forgot-password
│       │   ├── dashboard.routes.ts # /api/dashboard — aggregate KPIs
│       │   ├── sales.routes.ts     # /api/sales — list, summary, by-region
│       │   ├── customer.routes.ts  # /api/customers — list, summary
│       │   ├── finance.routes.ts   # /api/finance — P&L, expenses
│       │   ├── inventory.routes.ts # /api/inventory — stock levels, low stock
│       │   ├── ai.routes.ts        # /api/ai — forecast, recommendations, insights
│       │   ├── report.routes.ts    # /api/reports — list, generate
│       │   └── admin.routes.ts     # /api/admin — users, audit logs, system stats
│       │
│       └── services/
│           └── email.service.ts    # Nodemailer via Gmail SMTP
│                                   # sendWelcomeEmail, sendPasswordResetEmail,
│                                   # sendLoginAlertEmail, sendNotificationEmail
│
├── supabase_schema.sql             # Full DB schema + RLS policies + seed data
└── README.md
```

---

## Database Schema (Supabase)

Run `supabase_schema.sql` in the Supabase SQL Editor to create all tables.

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` — name, role (ADMIN/MANAGER/USER) |
| `products` | Product catalog with price and cost |
| `customers` | Customer records with region and segment |
| `sales` | Sales transactions linked to products and customers |
| `expenses` | Expense records by category |
| `budgets` | Budget allocations by category and period |
| `inventory` | Stock quantities and reorder points per product |
| `inventory_movements` | Stock in/out history |
| `reports` | Generated report metadata and file URLs |
| `notifications` | Per-user notifications with type and read status |
| `audit_logs` | User activity log for admin/compliance |

---

## Environment Variables

**`frontend/.env`**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**`backend/.env`**
```
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=your_16char_app_password
```

---

## Running Locally

**Backend** (port 5000):
```cmd
cd backend
npm run dev
```

**Frontend** (port 3000):
```cmd
cd frontend
npm run dev
```

Open `http://localhost:3000`

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | ✗ | Create account + send welcome email |
| POST | /api/auth/login | ✗ | Sign in + send login alert email |
| GET | /api/auth/me | ✓ | Get current user profile |
| POST | /api/auth/forgot-password | ✗ | Send password reset email |
| GET | /api/dashboard | ✓ | Aggregate KPI summary |
| GET | /api/sales | ✓ | Sales list |
| GET | /api/sales/summary | ✓ | Today/week/month totals + by-region |
| GET | /api/customers | ✓ | Customer list |
| GET | /api/customers/summary | ✓ | Total, new, by-segment |
| GET | /api/finance | ✓ | Revenue, expenses, profit |
| GET | /api/inventory | ✓ | Stock levels + low stock alerts |
| GET | /api/ai/forecast | ✓ | Revenue forecast |
| GET | /api/ai/recommendations | ✓ | AI action recommendations |
| GET | /api/ai/insights | ✓ | Business summary |
| GET | /api/reports | ✓ | Report list |
| POST | /api/reports/generate | ✓ | Queue report generation |
| GET | /api/admin/users | ✓ Admin | All user profiles |
| PATCH | /api/admin/users/:id/role | ✓ Admin | Update user role |
| GET | /api/admin/audit-logs | ✓ Admin | Activity audit log |
| GET | /api/admin/system | ✓ Admin | Server health stats |

---

## Email Notifications

All sent via Gmail SMTP using a 16-character App Password (2FA required on Gmail).

| Trigger | Email |
|---|---|
| User registers | Welcome email with dashboard link |
| User logs in | Sign-in alert with timestamp |
| Forgot password | Reset link email |
| Business event | Custom notification email |

---

## Pages

| Route | Page |
|---|---|
| `/` | Landing page |
| `/auth/login` | Sign in |
| `/auth/register` | Create account |
| `/auth/forgot-password` | Request password reset |
| `/auth/reset-password` | Set new password |
| `/dashboard` | Main KPI overview |
| `/analytics/sales` | Sales analytics |
| `/analytics/customers` | Customer analytics |
| `/analytics/finance` | Financial analytics |
| `/analytics/inventory` | Inventory analytics |
| `/ai/forecasting` | Revenue forecasting |
| `/ai/trends` | Trend prediction |
| `/ai/recommendations` | AI recommendations |
| `/reports` | Reports module |
| `/notifications` | Notification center |
| `/admin/users` | User management |
| `/admin/audit-logs` | Audit logs |
| `/admin/system-monitor` | System health |
| `/profile` | User profile |
| `/settings` | App settings |
