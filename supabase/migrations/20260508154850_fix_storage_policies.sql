-- Fix documents and covers bucket policies to use the correct format:
-- explicit role grant + WITH CHECK clause (matching the event-images policy pattern)

drop policy if exists "Service role can manage documents bucket" on storage.objects;
create policy "Service role can manage documents bucket"
  on storage.objects for all
  to service_role
  using (bucket_id = 'documents')
  with check (bucket_id = 'documents');

drop policy if exists "Service role can manage covers bucket" on storage.objects;
create policy "Service role can manage covers bucket"
  on storage.objects for all
  to service_role
  using (bucket_id = 'covers')
  with check (bucket_id = 'covers');
