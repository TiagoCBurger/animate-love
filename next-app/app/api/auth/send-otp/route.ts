import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Generate OTP via Admin API (does NOT send email)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (error) {
      console.error("generateLink error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const otp = data.properties.email_otp;

    // Send email via Resend HTTP API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Animalove <onboarding@resend.dev>",
        to: [email],
        subject: "Seu código de verificação - Animalove",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #ec4899; margin-bottom: 8px;">Animalove</h2>
            <p style="color: #666; margin-bottom: 24px;">Use o código abaixo para verificar seu email:</p>
            <div style="background: #f4f4f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${otp}</span>
            </div>
            <p style="color: #a1a1aa; font-size: 14px;">Este código expira em 1 hora. Se você não solicitou este código, ignore este email.</p>
          </div>
        `,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.json();
      console.error("Resend error:", resendError);
      return NextResponse.json(
        { error: "Erro ao enviar email. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
