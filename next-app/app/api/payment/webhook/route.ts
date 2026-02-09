import { NextRequest, NextResponse } from "next/server";
import { WebhookEvent } from "@/lib/abacatepay";
import { createAdminClient } from "@/lib/supabase/admin";
import { addCredits } from "@/lib/supabase/credits";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body: WebhookEvent = JSON.parse(rawBody);

    // Validate webhook secret from query params
    const webhookSecret = request.nextUrl.searchParams.get("webhookSecret");
    const expectedSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.error("Invalid webhook secret");
      return NextResponse.json(
        { error: "Invalid webhook secret" },
        { status: 401 }
      );
    }

    // Optionally validate HMAC signature from header
    const signature = request.headers.get("X-Webhook-Signature");
    const publicKey = process.env.ABACATEPAY_PUBLIC_KEY;

    if (signature && publicKey) {
      const expectedSignature = crypto
        .createHmac("sha256", publicKey)
        .update(rawBody)
        .digest("hex");

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    switch (body.event) {
      case "billing.paid":
        await handleBillingPaid(body);
        break;

      default:
        console.log("Unhandled webhook event:", (body as any).event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleBillingPaid(event: WebhookEvent) {
  if (event.event !== "billing.paid") return;

  const { billing } = event.data;
  const { id, amount, customer, products, paidAt } = billing;

  const product = products?.[0];
  const [planId, totalCreditsStr] = product?.externalId?.split(":") || [];
  const totalCredits = parseInt(totalCreditsStr) || 0;
  const email = customer.metadata.email;

  console.log("Payment received:", {
    billingId: id,
    amount: amount / 100,
    customerEmail: email,
    planId,
    totalCredits,
    paidAt,
  });

  if (!email) {
    console.error("No email in webhook customer metadata");
    return;
  }

  const supabase = createAdminClient();

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(
    (u) => u.email === email
  );

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    console.log("Found existing user:", userId);
  } else {
    // Create new user with email confirmed
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

    if (createError || !newUser.user) {
      console.error("Failed to create user:", createError);
      return;
    }

    userId = newUser.user.id;
    console.log("Created new user:", userId);
  }

  // Add credits
  if (totalCredits > 0) {
    try {
      const newBalance = await addCredits(userId, totalCredits, id);
      console.log(`Added ${totalCredits} credits to user ${userId}. New balance: ${newBalance}`);
    } catch (error) {
      console.error("Failed to add credits:", error);
    }
  }

  // Send magic link so user can log in
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const { error: otpError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${baseUrl}/funnel`,
      },
    });

    if (otpError) {
      console.error("Failed to generate magic link:", otpError);
      // Fallback: use signInWithOtp
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${baseUrl}/auth/confirm?next=/funnel`,
        },
      });
    }
  } catch (error) {
    console.error("Failed to send magic link:", error);
  }
}
