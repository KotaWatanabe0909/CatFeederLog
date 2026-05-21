"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getActiveMembership, setActiveHousehold } from "@/lib/active-household";

export async function updateDisplayName(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "未ログイン" };

  const name = (formData.get("displayName") as string)?.trim();
  if (!name) return { error: "名前を入力してください" };

  const { data, error } = await supabase
    .from("members")
    .update({ display_name: name })
    .eq("user_id", user.id)
    .select();

  if (error || !data || data.length === 0) return { error: "更新に失敗しました" };

  revalidatePath("/mypage");
  return {};
}

export async function updateHouseholdName(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "未ログイン" };

  const { data: memberships } = await supabase
    .from("members")
    .select("id, household_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!memberships || memberships.length === 0) return { error: "グループが見つかりません" };
  const member = await getActiveMembership(memberships);
  if (!member) return { error: "グループが見つかりません" };
  if ((member as typeof memberships[0]).role !== "owner") return { error: "オーナーのみ変更できます" };

  const name = (formData.get("householdName") as string)?.trim();
  if (!name) return { error: "名前を入力してください" };

  const { data, error } = await supabase
    .from("households")
    .update({ name })
    .eq("id", member.household_id)
    .select();

  if (error || !data || data.length === 0) return { error: "更新に失敗しました" };

  revalidatePath("/mypage");
  return {};
}

export async function switchHousehold(householdId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // verify the user actually belongs to this household
  const { data: membership } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .eq("household_id", householdId)
    .single();

  if (!membership) redirect("/mypage");

  await setActiveHousehold(householdId);
  redirect("/");
}

export async function deleteHousehold(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "未ログイン" };

  const householdId = formData.get("householdId") as string;

  const { error } = await supabase.rpc("delete_household", {
    p_household_id: householdId,
    p_user_id: user.id,
  });

  if (error) return { error: error.message };

  const { data: remaining } = await supabase
    .from("members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (remaining) {
    await setActiveHousehold(remaining.household_id);
    redirect("/");
  } else {
    redirect("/onboarding");
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
