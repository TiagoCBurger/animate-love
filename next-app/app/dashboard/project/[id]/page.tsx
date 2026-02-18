import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Generation } from "@/types/generation";
import { ProjectDetail } from "./ProjectDetail";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: generation, error } = await supabase
    .from("generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !generation) {
    redirect("/dashboard");
  }

  return <ProjectDetail generation={generation as Generation} />;
}
