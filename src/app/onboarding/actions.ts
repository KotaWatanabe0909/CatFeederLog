"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createHousehold(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const householdName = formData.get("householdName") as string;
  const catName = formData.get("catName") as string;
  const displayName = formData.get("displayName") as string;

  const { data: household, error: householdError } = await supabase
    .from("households")
    .insert({ name: householdName })
    .select()
    .single();

  if (householdError || !household) throw new Error("世帯の作成に失敗しました");

  const { error: memberError } = await supabase
    .from("members")
    .insert({ household_id: household.id, user_id: user.id, display_name: displayName, role: "owner" });

  if (memberError) throw new Error("メンバーの作成に失敗しました");

  const { error: catError } = await supabase
    .from("cats")
    .insert({ household_id: household.id, name: catName });

  if (catError) throw new Error("猫の登録に失敗しました");

  redirect("/");
}
