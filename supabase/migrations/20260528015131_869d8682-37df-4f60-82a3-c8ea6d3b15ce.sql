
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.design_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  lot_assignments JSONB NOT NULL DEFAULT '{}'::jsonb,
  district_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  target_profile TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.design_scenarios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.design_scenarios TO authenticated;
GRANT ALL ON public.design_scenarios TO service_role;

ALTER TABLE public.design_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view design scenarios"
ON public.design_scenarios FOR SELECT USING (true);
CREATE POLICY "Anyone can insert design scenarios"
ON public.design_scenarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update design scenarios"
ON public.design_scenarios FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete design scenarios"
ON public.design_scenarios FOR DELETE USING (true);

CREATE TRIGGER trg_design_scenarios_updated_at
BEFORE UPDATE ON public.design_scenarios
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.design_scenarios (name, slug, tagline, description, status, lot_assignments, district_summary, target_profile)
VALUES (
  'Town Center',
  'town-center',
  'Retail-dominant mixed-use with neighborhood services and restaurant pads',
  'A retail-forward master plan concept emphasizing high-visibility commercial pads, neighborhood services, restaurants, medical office, and supporting multifamily density.',
  'published',
  '{"1":"retail","2":"retail","3":"retail","4":"retail","5":"retail","6":"flex","7":"flex","8":"retail","9":"flex","10":"industrial","11":"industrial","12":"industrial","13":"multifamily","14":"multifamily","15":"multifamily","16":"multifamily","17":"retail","18":"industrial","19":"retail","20":"retail","21":"retail","22":"retail","23":"retail","24":"retail","25":"retail","26":"retail","27":"retail","28":"retail","29":"retail","30":"retail"}'::jsonb,
  '{"retail":{"label":"Retail / Commercial","acreage":35,"percentage":29,"color":"#3B6D11"},"multifamily":{"label":"Multifamily","acreage":40,"percentage":33,"color":"#D4A843"},"flex":{"label":"Flex / Office-Warehouse","acreage":15,"percentage":12,"color":"#0D7377"},"industrial":{"label":"Light Industrial","acreage":6,"percentage":5,"color":"#888780"},"common":{"label":"Infrastructure / Common","acreage":40,"percentage":21,"color":"#D6D3CB"}}'::jsonb,
  'Designed for retail developers, restaurant groups, medical office operators, and service-commercial users seeking high-visibility corner and frontage positions with a built-in residential customer base.'
);
