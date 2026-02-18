import { createClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/supabase/credits";
import type { Generation } from "@/types/generation";
import { DashboardContent } from "./_components/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: generations } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const balanceCents = await getBalance(user!.id);

  return (
    <DashboardContent
      generations={(generations as Generation[]) || []}
      balanceCents={balanceCents}
    />
  );
}
