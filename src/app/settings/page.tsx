import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InviteSection } from "./InviteSection";
import { AddCatForm } from "./AddCatForm";
import { CatItem } from "./CatItem";
import { signOut, restoreCat } from "./actions";
import { getActiveMembership } from "@/lib/active-household";

export default async function SettingsPage() {
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

  const [{ data: cats }, { data: deletedCats }] = await Promise.all([
    supabase
      .from("cats")
      .select("id, name")
      .eq("household_id", member.household_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("cats")
      .select("id, name")
      .eq("household_id", member.household_id)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 pb-24 pt-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <Link
            href="/"
            className="shrink-0 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm active:bg-gray-50"
          >
            ← 愛猫一覧へ
          </Link>
          <h1 className="text-xl font-bold">設定</h1>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 font-semibold">愛猫一覧</h2>
          <ul className="mb-4 flex flex-col gap-3">
            {(cats ?? []).map((cat) => (
              <li key={cat.id}>
                <CatItem cat={{ id: cat.id, name: cat.name }} />
              </li>
            ))}
          </ul>
          <AddCatForm />
        </section>

        {deletedCats && deletedCats.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-1 font-semibold text-gray-400">削除済みの猫</h2>
            <p className="mb-4 text-xs text-gray-400">
              給餌記録はそのまま保持されています
            </p>
            <ul className="flex flex-col gap-3">
              {deletedCats.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm opacity-60"
                >
                  <span className="font-medium text-gray-500">{cat.name}</span>
                  <form action={restoreCat}>
                    <input type="hidden" name="catId" value={cat.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-gray-900 underline underline-offset-2"
                    >
                      復元
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-10">
          <h2 className="mb-2 font-semibold">メンバーを招待</h2>
          <p className="mb-6 text-sm text-gray-500">
            リンクを共有すると、家族がこのグループに参加できます。
          </p>
          <InviteSection />
        </section>

        <section>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-500 active:bg-gray-50"
            >
              ログアウト
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
