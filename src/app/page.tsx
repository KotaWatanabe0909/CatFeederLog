import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type FeedingLog = {
  id: string;
  food_type: string;
  amount: string | null;
  fed_at: string;
  members: { display_name: string } | null;
  cats: { name: string } | null;
};

const FOOD_LABEL: Record<string, string> = { dry: "ドライ", wet: "ウェット" };
const AMOUNT_LABEL: Record<string, string> = { finished: "完食", leftover: "残した" };

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id, household_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: logs } = await supabase
    .from("feeding_logs")
    .select("id, food_type, amount, fed_at, members(display_name), cats(name)")
    .eq("household_id", member.household_id)
    .gte("fed_at", todayStart.toISOString())
    .order("fed_at", { ascending: false });

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">今日の給餌</h1>
          <Link href="/settings" className="text-sm text-gray-400">
            設定
          </Link>
        </div>

        <Link
          href="/record"
          className="mb-8 flex w-full items-center justify-center rounded-2xl bg-gray-900 py-5 text-lg font-semibold text-white active:bg-gray-700"
        >
          給餌した
        </Link>

        {!logs || logs.length === 0 ? (
          <p className="text-center text-gray-400">まだ記録がありません</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {(logs as unknown as FeedingLog[]).map((log) => (
              <li key={log.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {FOOD_LABEL[log.food_type] ?? log.food_type}
                    {log.amount && ` · ${AMOUNT_LABEL[log.amount] ?? log.amount}`}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(log.fed_at).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Tokyo",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {log.members?.display_name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
