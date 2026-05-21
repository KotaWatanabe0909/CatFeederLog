import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PushSubscriber } from "@/components/PushSubscriber";
import { CatLottie } from "@/components/CatLottie";
import { getActiveMembership } from "@/lib/active-household";

function getElapsedLabel(fedAt: string): string {
  const diff = Date.now() - new Date(fedAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

export default async function CatListPage() {
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

  const { data: cats } = await supabase
    .from("cats")
    .select("id, name, avatar_url")
    .eq("household_id", member.household_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const { data: recentLogs } = await supabase
    .from("feeding_logs")
    .select("cat_id, fed_at")
    .eq("household_id", member.household_id)
    .order("fed_at", { ascending: false })
    .limit(100);

  const lastFedMap: Record<string, string> = {};
  for (const log of recentLogs ?? []) {
    if (!lastFedMap[log.cat_id]) lastFedMap[log.cat_id] = log.fed_at;
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 pb-24 pt-8">
      <PushSubscriber />
      <div className="w-full max-w-md">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-xl font-bold">愛猫一覧</h1>
          <Link href="/settings" className="text-sm text-gray-500">
            設定
          </Link>
        </div>

        <CatLottie className="mx-auto mb-2 h-40 w-40" />

        <ul className="flex flex-col gap-3">
          {(cats ?? []).map((cat) => {
            const lastFedAt = lastFedMap[cat.id];
            return (
              <li key={cat.id}>
                <Link
                  href={`/cats/${cat.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm active:bg-gray-50"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100">
                    {cat.avatar_url ? (
                      <Image
                        src={cat.avatar_url}
                        alt={cat.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">
                        🐱
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold">{cat.name}</p>
                    <p className="mt-0.5 text-sm text-gray-400">
                      {lastFedAt
                        ? `最後のご飯 ${getElapsedLabel(lastFedAt)}`
                        : "まだ記録なし"}
                    </p>
                  </div>
                  <span className="text-2xl text-gray-200">›</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
