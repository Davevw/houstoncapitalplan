CREATE TABLE public.design_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  concept_name TEXT NOT NULL,
  description TEXT NOT NULL,
  priority_lots TEXT,
  target_client_type TEXT NOT NULL,
  clarifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted',
  submitted_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.design_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.design_requests TO authenticated;
GRANT ALL ON public.design_requests TO service_role;

ALTER TABLE public.design_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit design requests"
ON public.design_requests FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can view design requests"
ON public.design_requests FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can update design requests"
ON public.design_requests FOR UPDATE
TO public
USING (true);