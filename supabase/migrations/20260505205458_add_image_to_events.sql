alter table public.events add column image_path text;

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

create policy "Service role can manage event-images bucket"
  on storage.objects for all
  to service_role
  using (bucket_id = 'event-images')
  with check (bucket_id = 'event-images');
