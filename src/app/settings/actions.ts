"use server";

import { createClient } from "@/lib/supabase/server";

export async function createInvite(): Promise<{ token: string } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "未ログイン" };

  const { data: member } = await supabase
    .from("members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();
  if (!member) return { error: "世帯が見つかりません" };

  const { data, error } = await supabase
    .from("invites")
    .insert({ household_id: member.household_id })
    .select("token")
    .single();

  if (error || !data) return { error: "招待リンクの生成に失敗しました" };

  return { token: data.token };
}
