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
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!member) return NextResponse.json({ error: "no member" }, { status: 400 });

  const { endpoint } = (await req.json()) as { endpoint: string };

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("member_id", member.id)
    .eq("endpoint", endpoint);

  return NextResponse.json({ ok: true });
}
