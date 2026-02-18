// Plan configurations — defaults used when DB tables don't exist yet.
// The canonical source of truth is the `plans` table in Supabase.
// Edit plans via Supabase Dashboard > Table Editor > plans.

export interface Plan {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  price: number;        // price in BRL centavos
  description: string;
}

// Static defaults (kept as fallback)
export const PLANS: Record<string, Plan> = {
  plan_1: {
    id: "plan_1",
    name: "Plano Basico",
    credits: 500,
    bonusCredits: 0,
    totalCredits: 500,
    price: 1690,
    description: "~1 cena de 5s",
  },
  plan_2: {
    id: "plan_2",
    name: "Plano Popular",
    credits: 750,
    bonusCredits: 150,
    totalCredits: 900,
    price: 2990,
    description: "~2 cenas de 5s",
  },
  plan_3: {
    id: "plan_3",
    name: "Plano Pro",
    credits: 1500,
    bonusCredits: 300,
    totalCredits: 1800,
    price: 5990,
    description: "~4 cenas de 5s",
  },
};

export type PlanId = string;
