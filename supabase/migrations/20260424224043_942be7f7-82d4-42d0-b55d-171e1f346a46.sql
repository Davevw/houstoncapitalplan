CREATE TABLE public.access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  investor_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an access request"
  ON public.access_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view access requests"
  ON public.access_requests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update access requests"
  ON public.access_requests
  FOR UPDATE
  TO public
  USING (true);

CREATE INDEX idx_access_requests_status ON public.access_requests(status);
CREATE INDEX idx_access_requests_email ON public.access_requests(email);