"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getActiveMembership } from "@/lib/active-household";

async function verifyMembership(catId: string) {
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
  if (!memberships || memberships.length === 0) redirect("/");
  const member = await getActiveMembership(memberships);
  if (!member) redirect("/");

  const { data: cat } = await supabase
    .from("cats")
    .select("id")
    .eq("id", catId)
    .eq("household_id", member.household_id)
    .is("deleted_at", null)
    .single();
  if (!cat) redirect("/");

  return { supabase, member };
}

export async function updateCatAvatar(
  catId: string,
  avatarUrl: string
): Promise<{ avatarUrl: string } | { error: string }> {
  const { supabase, member } = await verifyMembership(catId);
  const { error } = await supabase
    .from("cats")
    .update({ avatar_url: avatarUrl })
    .eq("id", catId)
    .eq("household_id", member.household_id);

  if (error) return { error: "写真の保存に失敗しました" };

  revalidatePath(`/cats/${catId}`);
  revalidatePath(`/cats/${catId}/settings`);
  revalidatePath("/");
  return { avatarUrl };
}

export async function addFood(formData: FormData) {
  const catId = formData.get("catId") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  const { supabase } = await verifyMembership(catId);
  await supabase.from("foods").insert({ cat_id: catId, name });
  redirect(`/cats/${catId}/settings`);
}

export async function updateFood(formData: FormData) {
  const catId = formData.get("catId") as string;
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!name) redirect(`/cats/${catId}/settings`);

  const { supabase } = await verifyMembership(catId);
  await supabase.from("foods").update({ name }).eq("id", id);
  redirect(`/cats/${catId}/settings`);
}

export async function deleteFood(formData: FormData) {
  const catId = formData.get("catId") as string;
  const id = formData.get("id") as string;

  const { supabase } = await verifyMembership(catId);
  await supabase.from("foods").delete().eq("id", id);
  redirect(`/cats/${catId}/settings`);
}
