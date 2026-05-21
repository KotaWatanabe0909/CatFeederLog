import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getActiveMembership } from "@/lib/active-household";
import { FoodItem } from "./FoodItem";
import { CatAvatarUpload } from "./CatAvatarUpload";
import { addFood } from "./actions";

export default async function CatSettingsPage({
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

  const { data: foods } = await supabase
    .from("foods")
    .select("id, name")
    .eq("cat_id", catId)
    .order("created_at", { ascending: true });

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <Link
            href={`/cats/${cat.id}`}
            className="shrink-0 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm active:bg-gray-50"
          >
            ← 猫の画面へ
          </Link>
          <h1 className="text-xl font-bold">{cat.name}の設定</h1>
        </div>

        <section className="mb-10 flex flex-col items-center">
          <CatAvatarUpload catId={cat.id} currentUrl={cat.avatar_url ?? null} />
        </section>

        <section>
          <h2 className="mb-4 font-semibold">フード一覧</h2>

          {foods && foods.length > 0 ? (
            <ul className="mb-4 flex flex-col gap-3">
              {foods.map((food) => (
                <li key={food.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                  <FoodItem food={{ id: food.id, name: food.name, catId: cat.id }} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-gray-400">まだフードが登録されていません</p>
          )}

          <form action={addFood} className="flex gap-2">
            <input type="hidden" name="catId" value={cat.id} />
            <input
              name="name"
              required
              placeholder="例: ロイヤルカナン ドライ"
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white"
            >
              追加
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
