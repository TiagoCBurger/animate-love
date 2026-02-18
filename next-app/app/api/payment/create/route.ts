import { NextRequest, NextResponse } from "next/server";
import { createBilling } from "@/lib/abacatepay";
import { getPlanById } from "@/lib/supabase/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, customer } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Look up plan from DB (falls back to static defaults)
    const plan = await getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Validate customer
    if (!customer?.name || !customer?.email) {
      return NextResponse.json(
        { error: "Customer name and email are required" },
        { status: 400 }
      );
    }

    // Create billing with plan data from DB
    const billing = await createBilling({
      planId,
      plan: {
        id: plan.id,
        name: plan.name,
        credits: plan.credits,
        bonusCredits: plan.bonusCredits,
        totalCredits: plan.totalCredits,
        price: plan.priceCents,
        description: plan.description,
      },
      customer: {
        name: customer.name,
        email: customer.email,
        cellphone: customer.cellphone,
        taxId: customer.taxId,
      },
    });

    return NextResponse.json({
      success: true,
      billing: {
        id: billing.id,
        url: billing.url,
        amount: billing.amount,
        status: billing.status,
      },
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
