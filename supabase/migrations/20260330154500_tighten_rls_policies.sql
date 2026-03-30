-- Tighten RLS policies on vault_documents
-- Previously: anyone could SELECT, INSERT, DELETE with no restrictions
-- Now: SELECT and INSERT remain open (public data vault), DELETE restricted

-- Drop the overly permissive delete policy
DROP POLICY IF EXISTS "Anyone can delete vault documents" ON public.vault_documents;

-- Replace with a more restrictive delete policy (require uploaded_by match)
CREATE POLICY "Only uploader can delete vault documents"
  ON public.vault_documents FOR DELETE
  USING (uploaded_by = current_setting('request.jwt.claims', true)::json->>'sub'
    OR uploaded_by IS NULL);

-- Drop overly permissive storage delete policy
DROP POLICY IF EXISTS "Anyone can delete from data vault" ON storage.objects;

-- Replace with restricted storage delete
CREATE POLICY "Authenticated users can delete from data vault"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'itph-data-vault' AND auth.role() = 'authenticated');
