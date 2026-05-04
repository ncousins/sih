-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table public.users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  organisation text,
  tier text not null default 'standard',
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  category text,
  file_path text not null,
  is_paid boolean not null default false,
  price numeric(10,2),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.downloads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  payment_status text not null default 'free',
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  amount numeric(10,2) not null,
  currency text not null default 'ZAR',
  paystack_ref text unique,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  date timestamptz not null,
  location text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index on public.documents(is_published, created_at desc);
create index on public.documents(category);
create index on public.downloads(user_id);
create index on public.downloads(document_id);
create index on public.transactions(paystack_ref);
create index on public.members(email);
create index on public.events(is_published, date);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.members enable row level security;
alter table public.documents enable row level security;
alter table public.downloads enable row level security;
alter table public.transactions enable row level security;
alter table public.events enable row level security;

-- Helper: check if the current request is from a service-role key
-- (service role bypasses RLS automatically, so admin API calls use service key)

-- Documents: anyone can read published docs; only service role can write
create policy "Public can read published documents"
  on public.documents for select
  using (is_published = true);

-- Events: anyone can read published events
create policy "Public can read published events"
  on public.events for select
  using (is_published = true);

-- Users: insert allowed by anyone (email capture); no public reads
create policy "Anyone can insert users"
  on public.users for insert
  with check (true);

-- Downloads: insert allowed by anyone (triggered by download flow)
create policy "Anyone can insert downloads"
  on public.downloads for insert
  with check (true);

-- Transactions: insert allowed by anyone (triggered by payment webhook)
create policy "Anyone can insert transactions"
  on public.transactions for insert
  with check (true);

-- Members: no public access (checked server-side via service key)

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Create private documents bucket (documents accessed via signed URLs only)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Only service role can upload/delete; no public access
create policy "Service role can manage documents bucket"
  on storage.objects for all
  using (bucket_id = 'documents' and auth.role() = 'service_role');
