import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consumeBalance } from "@/lib/supabase/credits";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { amount_cents, type, description } = body;

    if (!amount_cents || typeof amount_cents !== "number" || amount_cents <= 0) {
      return NextResponse.json(
        { error: "Invalid amount_cents" },
        { status: 400 }
      );
    }

    if (!type || !["image_generation", "video_generation"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type" },
        { status: 400 }
      );
    }

    const result = await consumeBalance(user.id, amount_cents, type, description);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          required_cents: amount_cents,
          balance_cents: result.balance_cents,
        },
        { status: 402 }
      );
    }

    return NextResponse.json({
      success: true,
      balance_cents: result.balance_cents,
    });
  } catch (error) {
    console.error("Error consuming balance:", error);
    return NextResponse.json(
      { error: "Failed to consume balance" },
      { status: 500 }
    );
  }
}
