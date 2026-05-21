import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members")
    .select("id, household_id")
    .eq("user_id", user.id)
    .single();
  if (!member) return NextResponse.json({ error: "no member" }, { status: 400 });

  const body = await req.json();
  const { endpoint, keys } = body as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };

  await supabase.from("push_subscriptions").upsert(
    {
      member_id: member.id,
      household_id: member.household_id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    { onConflict: "member_id,endpoint" }
  );

  return NextResponse.json({ ok: true });
}
