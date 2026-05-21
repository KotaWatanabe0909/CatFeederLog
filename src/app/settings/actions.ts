"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getActiveMembership } from "@/lib/active-household";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateCatName(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("members")
    .select("id, household_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!memberships || memberships.length === 0) redirect("/settings");
  const member = await getActiveMembership(memberships);
  if (!member) redirect("/settings");

  const catId = formData.get("catId") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!name) redirect("/settings");

  const { error } = await supabase
    .from("cats")
    .update({ name })
    .eq("id", catId)
    .eq("household_id", member.household_id);

  if (error) throw new Error("名前の更新に失敗しました");

  redirect("/settings");
}

export async function deleteCat(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("members")
    .select("id, household_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!memberships || memberships.length === 0) redirect("/settings");
  const member = await getActiveMembership(memberships);
  if (!member) redirect("/settings");

  const catId = formData.get("catId") as string;
  const confirmName = formData.get("confirmName") as string;

  const { data: cat } = await supabase
    .from("cats")
    .select("name")
    .eq("id", catId)
    .eq("household_id", member.household_id)
    .single();

  if (!cat || cat.name !== confirmName) redirect("/settings");

  const { error } = await supabase
    .from("cats")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", catId)
    .eq("household_id", member.household_id);

  if (error) throw new Error("削除に失敗しました");

  redirect("/settings");
}

export async function restoreCat(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("members")
    .select("id, household_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!memberships || memberships.length === 0) redirect("/settings");
  const member = await getActiveMembership(memberships);
  if (!member) redirect("/settings");

  const catId = formData.get("catId") as string;

  await supabase
    .from("cats")
    .update({ deleted_at: null })
    .eq("id", catId)
    .eq("household_id", member.household_id);

  redirect("/settings");
}

export async function addCat(
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
    .select("id, household_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!memberships || memberships.length === 0) return { error: "グループが見つかりません" };
  const member = await getActiveMembership(memberships);
  if (!member) return { error: "グループが見つかりません" };

  const name = (formData.get("catName") as string)?.trim();
  if (!name) return { error: "名前を入力してください" };

  const { error } = await supabase
    .from("cats")
    .insert({ household_id: member.household_id, name });

  if (error) return { error: "追加に失敗しました" };

  redirect("/settings");
}

export async function createInvite(): Promise<{ token: string } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "未ログイン" };

  const { data: memberships } = await supabase
    .from("members")
    .select("id, household_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!memberships || memberships.length === 0) return { error: "グループが見つかりません" };
  const member = await getActiveMembership(memberships);
  if (!member) return { error: "グループが見つかりません" };

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("invites")
    .insert({ household_id: member.household_id, token, expires_at: expiresAt })
    .select("token")
    .single();

  if (error || !data) return { error: error?.message ?? "招待リンクの生成に失敗しました" };

  return { token: data.token };
}
