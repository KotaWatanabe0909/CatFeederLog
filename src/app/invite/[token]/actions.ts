"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function joinHousehold(token: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/invite/${token}`);

  // check already in a household
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (existing) redirect("/");

  // validate invite
  const { data: invite } = await supabase
    .from("invites")
    .select("id, household_id")
    .eq("token", token)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!invite) redirect("/invite/invalid");

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "メンバー";

  const { error: insertError } = await supabase.from("members").insert({
    household_id: invite.household_id,
    user_id: user.id,
    display_name: displayName,
  });

  if (insertError) throw new Error("参加に失敗しました");

  await supabase
    .from("invites")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invite.id);

  redirect("/");
}
