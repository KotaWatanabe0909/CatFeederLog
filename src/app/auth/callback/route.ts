import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const next = searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//")
    ? `${origin}${next}`
    : `${origin}/`;
  return NextResponse.redirect(destination);
}
