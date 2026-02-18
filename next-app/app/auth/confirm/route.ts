import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("next");

  const supabase = await createClient();

  // PKCE flow: Supabase redirects with a `code` after verifying the email
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
    redirectTo.pathname = "/auth/error";
    redirectTo.searchParams.set("error", error.message);
    return NextResponse.redirect(redirectTo);
  }

  // Implicit flow: token_hash + type passed directly
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
    redirectTo.pathname = "/auth/error";
    redirectTo.searchParams.set("error", error.message);
    return NextResponse.redirect(redirectTo);
  }

  redirectTo.pathname = "/auth/error";
  redirectTo.searchParams.set("error", "No token hash or type");
  return NextResponse.redirect(redirectTo);
}
