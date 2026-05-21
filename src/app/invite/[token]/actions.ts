"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { setActiveHousehold } from "@/lib/active-household";

export async function joinHousehold(token: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/invite/${token}`);

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "メンバー";

  const { data: householdId, error } = await supabase.rpc("join_household_by_invite", {
    p_token: token,
    p_display_name: displayName,
  });

  if (error || !householdId) throw new Error("参加に失敗しました");

  await setActiveHousehold(householdId);

  redirect("/");
}
