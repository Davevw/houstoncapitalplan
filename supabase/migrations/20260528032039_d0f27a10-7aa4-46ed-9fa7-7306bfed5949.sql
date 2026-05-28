
CREATE TABLE public.lot_economics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES public.design_scenarios(id) ON DELETE CASCADE,
  lot_number integer NOT NULL,
  district text,
  acreage numeric,
  position text,
  base_price_per_acre numeric,
  position_premium numeric,
  adjusted_price_per_acre numeric,
  estimated_lot_value numeric,
  estimated_development_cost numeric,
  projected_revenue numeric,
  projected_noi numeric,
  projected_net_proceeds numeric,
  capital_paydown_forecast numeric,
  simple_roi numeric,
  disposition text,
  assumptions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scenario_id, lot_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lot_economics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lot_economics TO authenticated;
GRANT ALL ON public.lot_economics TO service_role;

ALTER TABLE public.lot_economics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lot economics" ON public.lot_economics FOR SELECT USING (true);
CREATE POLICY "Anyone can insert lot economics" ON public.lot_economics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lot economics" ON public.lot_economics FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete lot economics" ON public.lot_economics FOR DELETE USING (true);

CREATE INDEX idx_lot_economics_scenario ON public.lot_economics(scenario_id);

CREATE TRIGGER update_lot_economics_updated_at
BEFORE UPDATE ON public.lot_economics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
