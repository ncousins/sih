alter table public.documents add column cover_image_path text;

-- Public bucket for cover images (no signed URLs needed)
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

-- Service role manages uploads; public read is handled by the bucket being public
create policy "Service role can manage covers bucket"
  on storage.objects for all
  using (bucket_id = 'covers' and auth.role() = 'service_role');
