"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateFeeding(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const catId = formData.get("catId") as string;
  const foodType = formData.get("foodType") as string;
  const amount = formData.get("amount") as string | null;

  const { error } = await supabase
    .from("feeding_logs")
    .update({ food_type: foodType, amount: amount || null })
    .eq("id", id);

  if (error) throw new Error("更新に失敗しました");

  redirect(`/cats/${catId}`);
}

export async function deleteFeeding(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const catId = formData.get("catId") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) redirect("/");

  const memberIds = memberships.map((m) => m.id);

  const { error } = await supabase
    .from("feeding_logs")
    .delete()
    .eq("id", id)
    .in("member_id", memberIds);

  if (error) throw new Error("削除に失敗しました");

  redirect(`/cats/${catId}`);
}
