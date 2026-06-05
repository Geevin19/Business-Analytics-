-- ============================================
-- Business Analytics - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  role text not null default 'USER' check (role in ('ADMIN', 'MANAGER', 'USER')),
  created_at timestamptz default now()
);

-- 2. Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price numeric(10,2) not null default 0,
  cost numeric(10,2) not null default 0,
  created_at timestamptz default now()
);

-- 3. Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text,
  region text,
  segment text default 'Regular' check (segment in ('Premium', 'Regular', 'New', 'Churned')),
  created_at timestamptz default now()
);

-- 4. Sales
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  total numeric(10,2) generated always as (quantity * unit_price) stored,
  region text,
  sale_date date not null default current_date,
  created_at timestamptz default now()
);

-- 5. Expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text,
  amount numeric(10,2) not null,
  expense_date date not null default current_date,
  created_at timestamptz default now()
);

-- 6. Budgets
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  allocated_amount numeric(10,2) not null,
  period text not null,
  created_at timestamptz default now()
);

-- 7. Inventory
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade unique,
  stock_quantity integer not null default 0,
  reorder_point integer not null default 50,
  last_updated timestamptz default now()
);

-- 8. Inventory Movements
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  type text check (type in ('IN', 'OUT')),
  quantity integer not null,
  note text,
  created_at timestamptz default now()
);

-- 9. Reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('PDF', 'EXCEL', 'CSV')),
  status text default 'PENDING' check (status in ('PENDING', 'READY', 'FAILED')),
  generated_by uuid references auth.users(id) on delete set null,
  file_url text,
  created_at timestamptz default now()
);

-- 10. Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'INFO' check (type in ('INFO', 'WARNING', 'SUCCESS', 'DANGER')),
  read boolean default false,
  created_at timestamptz default now()
);

-- 11. Audit Logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  action text not null,
  ip text,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security
-- ============================================

alter table public.profiles enable row level security;
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
);

alter table public.notifications enable row level security;
create policy "Own notifications" on public.notifications for all using (auth.uid() = user_id);

alter table public.audit_logs enable row level security;
create policy "Admin only audit" on public.audit_logs for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
);

alter table public.sales enable row level security;
create policy "Authenticated sales" on public.sales for all using (auth.role() = 'authenticated');

alter table public.products enable row level security;
create policy "Authenticated products" on public.products for all using (auth.role() = 'authenticated');

alter table public.customers enable row level security;
create policy "Authenticated customers" on public.customers for all using (auth.role() = 'authenticated');

alter table public.expenses enable row level security;
create policy "Authenticated expenses" on public.expenses for all using (auth.role() = 'authenticated');

alter table public.budgets enable row level security;
create policy "Authenticated budgets" on public.budgets for all using (auth.role() = 'authenticated');

alter table public.inventory enable row level security;
create policy "Authenticated inventory" on public.inventory for all using (auth.role() = 'authenticated');

alter table public.inventory_movements enable row level security;
create policy "Authenticated movements" on public.inventory_movements for all using (auth.role() = 'authenticated');

alter table public.reports enable row level security;
create policy "Authenticated reports" on public.reports for all using (auth.role() = 'authenticated');

-- ============================================
-- Seed Data (sample data to test with)
-- ============================================

insert into public.products (name, category, price, cost) values
  ('Widget A', 'Electronics', 49.99, 20.00),
  ('Widget B', 'Electronics', 79.99, 35.00),
  ('Widget C', 'Accessories', 29.99, 10.00),
  ('Widget D', 'Accessories', 19.99, 8.00),
  ('Widget E', 'Software', 199.99, 5.00);

insert into public.customers (name, email, region, segment) values
  ('Alice Corp', 'alice@corp.com', 'North', 'Premium'),
  ('Bob Enterprises', 'bob@ent.com', 'South', 'Regular'),
  ('Carol LLC', 'carol@llc.com', 'East', 'New'),
  ('David Inc', 'david@inc.com', 'West', 'Regular'),
  ('Eva Solutions', 'eva@sol.com', 'North', 'Premium');

insert into public.expenses (category, description, amount, expense_date) values
  ('Marketing', 'Google Ads Q2', 8000.00, '2026-04-01'),
  ('Operations', 'Office Supplies', 1200.00, '2026-04-15'),
  ('Software', 'SaaS Subscriptions', 3400.00, '2026-05-01'),
  ('Marketing', 'Social Media Campaign', 5500.00, '2026-05-20'),
  ('Operations', 'Shipping & Logistics', 2100.00, '2026-06-01');

insert into public.budgets (category, allocated_amount, period) values
  ('Marketing', 20000.00, '2026-Q2'),
  ('Operations', 15000.00, '2026-Q2'),
  ('Software', 10000.00, '2026-Q2'),
  ('HR', 8000.00, '2026-Q2');
