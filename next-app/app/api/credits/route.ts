import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCredits, getBalance } from "@/lib/supabase/credits";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const [credits, balance_cents] = await Promise.all([
      getCredits(user.id),
      getBalance(user.id),
    ]);

    return NextResponse.json({ credits, balance_cents });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
