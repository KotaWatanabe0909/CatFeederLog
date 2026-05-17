"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logFeeding(formData: FormData) {
  const supabase = await createClient();

  const memberId = formData.get("memberId") as string;
  const householdId = formData.get("householdId") as string;
  const catId = formData.get("catId") as string;
  const foodType = formData.get("foodType") as string;
  const amount = formData.get("amount") as string | null;

  const { error } = await supabase.from("feeding_logs").insert({
    household_id: householdId,
    cat_id: catId,
    member_id: memberId,
    food_type: foodType,
    amount: amount || null,
  });

  if (error) throw new Error("記録に失敗しました");

  redirect("/");
}
