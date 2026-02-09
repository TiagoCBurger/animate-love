import { NextRequest, NextResponse } from "next/server";
import { createBilling, PLANS, PlanId } from "@/lib/abacatepay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, customer } = body;

    // Validate plan
    if (!planId || !PLANS[planId as PlanId]) {
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

    // Create billing
    const billing = await createBilling({
      planId: planId as PlanId,
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
