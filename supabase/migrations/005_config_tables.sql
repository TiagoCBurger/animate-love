-- Tabela de custos de geração (editável via Supabase Dashboard)
-- cost_brl_cents = custo real em centavos BRL para a plataforma
-- credits = créditos cobrados do usuário
CREATE TABLE IF NOT EXISTS public.generation_costs (
  key TEXT PRIMARY KEY,
  cost_brl_cents INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de planos (editável via Supabase Dashboard)
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  price_cents INTEGER NOT NULL,
  description TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed: custos de geração
INSERT INTO public.generation_costs (key, cost_brl_cents, credits) VALUES
  ('image', 10, 10),
  ('video_per_second', 75, 75)
ON CONFLICT (key) DO NOTHING;

-- Seed: planos (a partir de R$16,90, custo máximo 30%)
INSERT INTO public.plans (id, name, credits, bonus_credits, price_cents, description, sort_order) VALUES
  ('plan_1', 'Plano Basico', 500, 0, 1690, '~1 cena de 5s', 1),
  ('plan_2', 'Plano Popular', 750, 150, 2990, '~2 cenas de 5s', 2),
  ('plan_3', 'Plano Pro', 1500, 300, 5990, '~4 cenas de 5s', 3)
ON CONFLICT (id) DO NOTHING;

-- RLS: leitura pública (são configs, não dados sensíveis)
ALTER TABLE public.generation_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read generation_costs" ON public.generation_costs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read active plans" ON public.plans
  FOR SELECT USING (active = true);
