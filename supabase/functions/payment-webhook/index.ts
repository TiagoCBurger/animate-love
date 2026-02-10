import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-webhook-signature, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Validate webhook secret from query params
    const url = new URL(req.url);
    const webhookSecret = url.searchParams.get("webhookSecret");
    const expectedSecret = Deno.env.get("ABACATEPAY_WEBHOOK_SECRET");

    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.error("Invalid webhook secret");
      return new Response(JSON.stringify({ error: "Invalid webhook secret" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optionally validate HMAC signature from header
    const signature = req.headers.get("X-Webhook-Signature");
    const publicKey = Deno.env.get("ABACATEPAY_PUBLIC_KEY");

    if (signature && publicKey) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(publicKey),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
      const expectedSignature = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== expectedSignature) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Process event
    switch (body.event) {
      case "billing.paid":
        await handleBillingPaid(body);
        break;
      default:
        console.log("Unhandled webhook event:", body.event);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function handleBillingPaid(event: {
  event: string;
  data: {
    billing: {
      id: string;
      amount: number;
      customer: { metadata: { name: string; email: string; cellphone: string; taxId: string } };
      products: Array<{ externalId: string; name: string; quantity: number; price: number }>;
      paidAt: string;
    };
  };
}) {
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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Find user by email (user should already exist — verified via OTP before payment)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, credits")
    .eq("email", email)
    .single();

  if (profileError || !profile) {
    console.error("User not found for email:", email, profileError);
    return;
  }

  const userId = profile.id;
  console.log("Found user:", userId, "current credits:", profile.credits);

  // Add credits
  if (totalCredits > 0) {
    try {
      const newCredits = profile.credits + totalCredits;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: newCredits, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (updateError) {
        console.error("Failed to update credits:", updateError);
        return;
      }

      // Record transaction
      const { error: txError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: userId,
          amount: totalCredits,
          type: "purchase",
          description: `Compra de ${totalCredits} créditos`,
          billing_id: id,
        });

      if (txError) console.error("Failed to record transaction:", txError);

      console.log(`Added ${totalCredits} credits to user ${userId}. New balance: ${newCredits}`);
    } catch (error) {
      console.error("Failed to add credits:", error);
    }
  }
}
