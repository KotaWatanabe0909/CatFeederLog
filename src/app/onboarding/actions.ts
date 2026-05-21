"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { setActiveHousehold } from "@/lib/active-household";

export async function createHousehold(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const householdName = formData.get("householdName") as string;
  const catName = formData.get("catName") as string;
  const displayName = formData.get("displayName") as string;

  const householdId = randomUUID();

  const { error } = await supabase.rpc("create_household", {
    p_household_name: householdName,
    p_display_name: displayName,
    p_cat_name: catName,
    p_household_id: householdId,
    p_user_id: user.id,
  });

  if (error) return { error: `グループの作成に失敗しました: ${error.message}` };

  await setActiveHousehold(householdId);

  redirect("/");
}
