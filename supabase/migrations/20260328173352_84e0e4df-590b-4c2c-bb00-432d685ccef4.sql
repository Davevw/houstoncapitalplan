-- Create vault_documents table
CREATE TABLE public.vault_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by TEXT
);

-- Enable RLS
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read documents (public data vault)
CREATE POLICY "Anyone can view vault documents"
  ON public.vault_documents FOR SELECT
  USING (true);

-- Allow anyone to insert documents (auth later)
CREATE POLICY "Anyone can upload vault documents"
  ON public.vault_documents FOR INSERT
  WITH CHECK (true);

-- Allow anyone to delete vault documents
CREATE POLICY "Anyone can delete vault documents"
  ON public.vault_documents FOR DELETE
  USING (true);

-- Create storage bucket for data vault
INSERT INTO storage.buckets (id, name, public)
VALUES ('itph-data-vault', 'itph-data-vault', true);

-- Storage policies
CREATE POLICY "Data vault files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'itph-data-vault');

CREATE POLICY "Anyone can upload to data vault"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'itph-data-vault');

CREATE POLICY "Anyone can delete from data vault"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'itph-data-vault');