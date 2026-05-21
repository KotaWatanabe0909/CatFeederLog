"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateFeeding(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const foodType = formData.get("foodType") as string;
  const amount = formData.get("amount") as string | null;

  const { error } = await supabase
    .from("feeding_logs")
    .update({ food_type: foodType, amount: amount || null })
    .eq("id", id);

  if (error) throw new Error("更新に失敗しました");

  redirect("/");
}
