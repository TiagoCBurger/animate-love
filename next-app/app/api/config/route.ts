import { NextResponse } from "next/server";
import { getCosts, getPlans } from "@/lib/supabase/config";

export async function GET() {
  try {
    const [costs, plans] = await Promise.all([getCosts(), getPlans()]);
    return NextResponse.json({ costs, plans });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { error: "Failed to fetch config" },
      { status: 500 }
    );
  }
}
