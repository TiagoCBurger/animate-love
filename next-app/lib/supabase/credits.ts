import { createAdminClient } from "./admin";

// =============================================================================
// Legacy credit functions (kept for temporary compatibility)
// =============================================================================

export async function getCredits(userId: string): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error) throw new Error(`Failed to get credits: ${error.message}`);
  return data.credits;
}

export async function hasCredits(userId: string): Promise<boolean> {
  const credits = await getCredits(userId);
  return credits >= 1;
}

export async function addCredits(
  userId: string,
  amount: number,
  billingId?: string
): Promise<number> {
  const supabase = createAdminClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (profileError) throw new Error(`Failed to get profile: ${profileError.message}`);

  const newCredits = profile.credits + amount;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ credits: newCredits, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (updateError) throw new Error(`Failed to update credits: ${updateError.message}`);

  const { error: txError } = await supabase
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount,
      type: "purchase",
      description: `Compra de ${amount} créditos`,
      billing_id: billingId || null,
    });

  if (txError) console.error("Failed to record transaction:", txError);

  return newCredits;
}

export async function consumeCredit(userId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (profileError) throw new Error(`Failed to get profile: ${profileError.message}`);

  if (profile.credits < 1) return false;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ credits: profile.credits - 1, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (updateError) throw new Error(`Failed to consume credit: ${updateError.message}`);

  const { error: txError } = await supabase
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount: -1,
      type: "consumption",
      description: "Geração de vídeo",
    });

  if (txError) console.error("Failed to record transaction:", txError);

  return true;
}

// =============================================================================
// New balance functions (BRL centavos)
// =============================================================================

// Helper: read current balance, falling back to credits * 495 if migration not applied
async function readCurrentBalance(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<{ balanceCents: number; migrated: boolean }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("balance_cents, credits")
    .eq("id", userId)
    .single();

  // If the query succeeds, the column exists
  if (!error) {
    return {
      balanceCents: data.balance_cents ?? (data.credits ?? 0) * 495,
      migrated: true,
    };
  }

  // Column doesn't exist yet — fall back to credits-only query
  if (error.message.includes("balance_cents")) {
    const { data: fallback, error: fallbackError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (fallbackError) throw new Error(`Failed to get profile: ${fallbackError.message}`);
    return {
      balanceCents: (fallback.credits ?? 0) * 495,
      migrated: false,
    };
  }

  throw new Error(`Failed to get balance: ${error.message}`);
}

export async function getBalance(userId: string): Promise<number> {
  const supabase = createAdminClient();
  const { balanceCents } = await readCurrentBalance(supabase, userId);
  return balanceCents;
}

export async function addBalance(
  userId: string,
  amountCents: number,
  billingId?: string,
  description?: string
): Promise<number> {
  const supabase = createAdminClient();
  const { balanceCents, migrated } = await readCurrentBalance(supabase, userId);

  if (!migrated) throw new Error("Migration 004_credits_to_balance has not been applied yet");

  const newBalance = balanceCents + amountCents;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ balance_cents: newBalance, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (updateError) throw new Error(`Failed to update balance: ${updateError.message}`);

  const { error: txError } = await supabase
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount_cents: amountCents,
      operation_type: "deposit",
      type: "purchase",
      description: description || `Depósito de R$ ${(amountCents / 100).toFixed(2)}`,
      billing_id: billingId || null,
    });

  if (txError) console.error("Failed to record transaction:", txError);

  return newBalance;
}

export async function consumeBalance(
  userId: string,
  amountCents: number,
  operationType: string,
  description?: string
): Promise<{ success: boolean; balance_cents: number }> {
  const supabase = createAdminClient();
  const { balanceCents, migrated } = await readCurrentBalance(supabase, userId);

  if (!migrated) throw new Error("Migration 004_credits_to_balance has not been applied yet");

  if (balanceCents < amountCents) {
    return { success: false, balance_cents: balanceCents };
  }

  const newBalance = balanceCents - amountCents;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ balance_cents: newBalance, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (updateError) throw new Error(`Failed to consume balance: ${updateError.message}`);

  const { error: txError } = await supabase
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount_cents: -amountCents,
      operation_type: operationType,
      type: "consumption",
      description: description || `Consumo: ${operationType}`,
    });

  if (txError) console.error("Failed to record transaction:", txError);

  return { success: true, balance_cents: newBalance };
}
