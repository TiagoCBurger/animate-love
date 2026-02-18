import { createAdminClient } from "./admin";

// ---- Types ----

export interface GenerationCost {
  key: string;
  cost_brl_cents: number;
  credits: number;
}

export interface CostsConfig {
  image: number;           // credits charged per image
  video_per_second: number; // credits charged per second of video
}

export interface PlanConfig {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  priceCents: number;
  description: string;
  sortOrder: number;
}

// ---- Defaults (used when tables don't exist yet) ----

const DEFAULT_COSTS: CostsConfig = {
  image: 10,
  video_per_second: 75,
};

const DEFAULT_PLANS: PlanConfig[] = [
  { id: "plan_1", name: "Plano Basico", credits: 500, bonusCredits: 0, totalCredits: 500, priceCents: 1690, description: "~1 cena de 5s", sortOrder: 1 },
  { id: "plan_2", name: "Plano Popular", credits: 750, bonusCredits: 150, totalCredits: 900, priceCents: 2990, description: "~2 cenas de 5s", sortOrder: 2 },
  { id: "plan_3", name: "Plano Pro", credits: 1500, bonusCredits: 300, totalCredits: 1800, priceCents: 5990, description: "~4 cenas de 5s", sortOrder: 3 },
];

// ---- Server functions ----

export async function getCosts(): Promise<CostsConfig> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("generation_costs")
      .select("key, credits");

    if (error) throw error;
    if (!data || data.length === 0) return DEFAULT_COSTS;

    const costs = { ...DEFAULT_COSTS };
    for (const row of data) {
      if (row.key === "image") costs.image = row.credits;
      if (row.key === "video_per_second") costs.video_per_second = row.credits;
    }
    return costs;
  } catch (err) {
    console.warn("Failed to read generation_costs, using defaults:", err);
    return DEFAULT_COSTS;
  }
}

export async function getPlans(): Promise<PlanConfig[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("plans")
      .select("id, name, credits, bonus_credits, price_cents, description, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return DEFAULT_PLANS;

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      credits: row.credits,
      bonusCredits: row.bonus_credits,
      totalCredits: row.credits + row.bonus_credits,
      priceCents: row.price_cents,
      description: row.description || "",
      sortOrder: row.sort_order,
    }));
  } catch (err) {
    console.warn("Failed to read plans, using defaults:", err);
    return DEFAULT_PLANS;
  }
}

/** Get a single plan by ID (for billing/webhook). */
export async function getPlanById(planId: string): Promise<PlanConfig | null> {
  const plans = await getPlans();
  return plans.find((p) => p.id === planId) || null;
}
