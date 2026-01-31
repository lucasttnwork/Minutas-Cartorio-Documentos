-- Create storage bucket for documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos',
  'documentos',
  false,
  52428800, -- 50MB limit
  array['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff']
) on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload to own folders" on storage.objects
  for insert with check (
    bucket_id = 'documentos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own files" on storage.objects
  for select using (
    bucket_id = 'documentos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own files" on storage.objects
  for update using (
    bucket_id = 'documentos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own files" on storage.objects
  for delete using (
    bucket_id = 'documentos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
