create table public.site_settings (
  key        text primary key,
  label      text not null,
  value      text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

grant all on public.site_settings to service_role;

insert into public.site_settings (key, label, value) values
  ('email_from_name',    'Email sender name',    'BPESA SIH'),
  ('email_from_address', 'Email sender address', 'neville@nevillecousins.com');
