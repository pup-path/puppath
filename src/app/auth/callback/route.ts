import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") ? next : "/";

  const supabase = await createClient();
  let failed = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = !!error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "magiclink" | "email" });
    failed = !!error;
  } else {
    failed = true;
  }

  if (failed) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("That sign-in link didn't work. Request a new one.")}`);
  }
  return NextResponse.redirect(`${origin}${safeNext}`);
}
