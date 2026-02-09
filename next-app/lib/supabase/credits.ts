import { createAdminClient } from "./admin";

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

  // Update credits on profile
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

  // Record transaction
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

  // Record transaction
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
