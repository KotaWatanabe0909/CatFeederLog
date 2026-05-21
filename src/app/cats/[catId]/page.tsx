import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getActiveMembership } from "@/lib/active-household";
import { CatAvatarUpload } from "./settings/CatAvatarUpload";

type FeedingLog = {
  id: string;
  food_type: string;
  amount: string | null;
  fed_at: string;
  members: { display_name: string } | null;
};

const AMOUNT_LABEL: Record<string, string> = {
  all: "完食",
  most: "ほぼ完食",
  half: "半分",
  little: "少し残した",
  none: "ほとんど食べず",
};

function getElapsedLabel(fedAt: string): string {
  const diff = Date.now() - new Date(fedAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

function toJSTDateKey(fedAt: string): string {
  return new Date(fedAt).toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

function getDateLabel(dateKey: string): string {
  const now = new Date();
  const todayKey = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  const yesterdayKey = new Date(now.getTime() - 86400000).toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  });
  if (dateKey === todayKey) return "今日";
  if (dateKey === yesterdayKey) return "昨日";
  const [year, month, day] = dateKey.split("-");
  const currentYear = todayKey.split("-")[0];
  return year === currentYear
    ? `${parseInt(month)}月${parseInt(day)}日`
    : `${year}年${parseInt(month)}月${parseInt(day)}日`;
}

export default async function CatHomePage({
  params,
}: {
  params: Promise<{ catId: string }>;
}) {
  const { catId } = await params;
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

  if (!memberships || memberships.length === 0) redirect("/onboarding");
  const member = await getActiveMembership(memberships);
  if (!member) redirect("/onboarding");

  const { data: cat } = await supabase
    .from("cats")
    .select("id, name, avatar_url")
    .eq("id", catId)
    .eq("household_id", member.household_id)
    .is("deleted_at", null)
    .single();

  if (!cat) notFound();

  const { data: rawLogs } = await supabase
    .from("feeding_logs")
    .select("id, food_type, amount, fed_at, members(display_name)")
    .eq("household_id", member.household_id)
    .eq("cat_id", catId)
    .order("fed_at", { ascending: false })
    .limit(50);

  const logs = (rawLogs ?? []) as unknown as FeedingLog[];

  const grouped = Map.groupBy(logs, (log) => toJSTDateKey(log.fed_at));
  const dateKeys = [...grouped.keys()];

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 pb-24 pt-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm active:bg-gray-50"
          >
            ← 愛猫一覧へ
          </Link>
          <Link
            href={`/cats/${cat.id}/settings`}
            className="rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm active:bg-gray-50"
          >
            設定
          </Link>
        </div>

        <section className="mb-8 flex flex-col items-center">
          <CatAvatarUpload catId={cat.id} currentUrl={cat.avatar_url ?? null} size="lg" />
          <h1 className="mt-4 text-2xl font-bold">{cat.name}</h1>
        </section>

        {logs.length > 0 ? (
          <div className="mb-4 rounded-xl bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-500">最後のご飯</p>
            <p className="text-lg font-semibold">{getElapsedLabel(logs[0].fed_at)}</p>
          </div>
        ) : (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-700">まだ記録がありません</p>
          </div>
        )}

        <Link
          href={`/record?catId=${cat.id}`}
          className="mb-8 flex w-full items-center justify-center rounded-2xl bg-gray-900 py-5 text-lg font-semibold text-white active:bg-gray-700"
        >
          ご飯をあげた
        </Link>

        {dateKeys.length > 0 && (
          <div className="flex flex-col gap-6">
            {dateKeys.map((dateKey) => {
              const dayLogs = grouped.get(dateKey)!;
              return (
                <div key={dateKey}>
                  <p className="mb-2 text-xs font-medium text-gray-400">
                    {getDateLabel(dateKey)}
                  </p>
                  <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    {dayLogs.map((log, i) => (
                      <Link
                        key={log.id}
                        href={`/record/${log.id}/edit`}
                        className={`flex items-center gap-4 px-4 py-3 active:bg-gray-50 ${
                          i !== 0 ? "border-t border-gray-100" : ""
                        }`}
                      >
                        <span className="w-12 shrink-0 text-sm tabular-nums text-gray-400">
                          {new Date(log.fed_at).toLocaleTimeString("ja-JP", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Tokyo",
                          })}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{log.food_type}</p>
                          <p className="text-xs text-gray-400">
                            {log.members?.display_name}
                          </p>
                        </div>
                        {log.amount && (
                          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            {AMOUNT_LABEL[log.amount] ?? log.amount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
