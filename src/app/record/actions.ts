"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import webpush from "web-push";

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

  // send push notifications to all household members
  const { data: member } = await supabase
    .from("members")
    .select("display_name")
    .eq("id", memberId)
    .single();

  const FOOD_LABEL: Record<string, string> = { dry: "ドライ", wet: "ウェット" };
  const body = `${member?.display_name ?? "誰か"} が ${FOOD_LABEL[foodType] ?? foodType} をあげました`;

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("household_id", householdId);

  const vapidReady =
    process.env.VAPID_SUBJECT &&
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY;

  if (vapidReady && subscriptions && subscriptions.length > 0) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    const payload = JSON.stringify({ title: "給餌記録", body });
    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    );
  }

  redirect("/");
}
