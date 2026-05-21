import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "./actions";
import { EditDisplayName } from "./EditDisplayName";
import { EditHouseholdName } from "./EditHouseholdName";
import { GroupSection } from "./GroupSection";
import { NotificationToggle } from "./NotificationToggle";
import { getActiveMembership } from "@/lib/active-household";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("members")
    .select("id, display_name, household_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!memberships || memberships.length === 0) redirect("/onboarding");
  const member = await getActiveMembership(memberships);
  if (!member) redirect("/onboarding");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // fetch data for the active household
  const [
    { count: todayCount },
    { count: monthCount },
    { data: household },
    { data: householdMembers },
  ] = await Promise.all([
    supabase
      .from("feeding_logs")
      .select("id", { count: "exact", head: true })
      .eq("member_id", member.id)
      .gte("fed_at", todayStart.toISOString()),
    supabase
      .from("feeding_logs")
      .select("id", { count: "exact", head: true })
      .eq("member_id", member.id)
      .gte("fed_at", monthStart.toISOString()),
    supabase
      .from("households")
      .select("name")
      .eq("id", member.household_id)
      .single(),
    supabase
      .from("members")
      .select("id, display_name, role")
      .eq("household_id", member.household_id)
      .order("created_at", { ascending: true }),
  ]);

  // fetch all households the user belongs to with member counts
  const householdIds = memberships.map((m) => m.household_id);
  const [{ data: allHouseholdData }, { data: allMemberCounts }] =
    await Promise.all([
      supabase
        .from("households")
        .select("id, name")
        .in("id", householdIds),
      supabase
        .from("members")
        .select("household_id")
        .in("household_id", householdIds),
    ]);

  const memberCountMap: Record<string, number> = {};
  for (const m of allMemberCounts ?? []) {
    memberCountMap[m.household_id] = (memberCountMap[m.household_id] ?? 0) + 1;
  }

  const allHouseholds = (allHouseholdData ?? []).map((h) => ({
    household_id: h.id,
    householdName: h.name,
    memberCount: memberCountMap[h.id] ?? 0,
  }));

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 pb-24 pt-8">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-xl font-bold text-gray-900">マイページ</h1>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold text-gray-900">プロフィール</p>
          <EditDisplayName current={member.display_name} />
          <p className="mt-2 text-sm text-gray-900">{user.email}</p>
        </section>

        <GroupSection
          households={allHouseholds.map((h) => ({
            ...h,
            isOwner: memberships.find((m) => m.household_id === h.household_id)?.role === "owner",
          }))}
          activeHouseholdId={member.household_id}
        />

        <Link
          href="/onboarding"
          className="mb-4 block rounded-2xl border border-gray-200 bg-white py-4 text-center text-sm font-medium text-gray-900 shadow-sm active:bg-gray-50"
        >
          新しいグループを作成
        </Link>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold text-gray-900">
            現在のグループのメンバー
          </p>
          <div className="mb-3">
            <EditHouseholdName
              current={household?.name ?? ""}
              isOwner={member.role === "owner"}
            />
          </div>
          <ul className="flex flex-col gap-2">
            {(householdMembers ?? []).map((m) => (
              <li key={m.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-900">
                  {m.display_name}
                  {m.id === member.id && (
                    <span className="ml-1 text-xs text-gray-900">
                      （あなた）
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-900">
                  {m.role === "owner" ? "オーナー" : "メンバー"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold text-gray-900">給餌の記録</p>
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {todayCount ?? 0}
              </p>
              <p className="text-sm text-gray-900">今日</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {monthCount ?? 0}
              </p>
              <p className="text-sm text-gray-900">今月</p>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold text-gray-900">プッシュ通知</p>
          <NotificationToggle />
        </section>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-2xl border border-gray-200 bg-white py-4 text-sm font-medium text-gray-900 active:bg-gray-50"
          >
            ログアウト
          </button>
        </form>
      </div>
    </main>
  );
}
