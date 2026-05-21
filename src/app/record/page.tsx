import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logFeeding } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { getActiveMembership } from "@/lib/active-household";

export default async function RecordPage({
  searchParams,
}: {
  searchParams: Promise<{ catId?: string }>;
}) {
  const { catId } = await searchParams;
  if (!catId) redirect("/");

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
    .select("id, name")
    .eq("id", catId)
    .eq("household_id", member.household_id)
    .is("deleted_at", null)
    .single();
  if (!cat) redirect("/");

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
          <h1 className="text-xl font-bold">{cat.name}のご飯を記録</h1>
        </div>

        {!foods || foods.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
            <p className="mb-3 text-sm text-gray-500">
              フードが登録されていません
            </p>
            <Link
              href={`/cats/${cat.id}/settings`}
              className="text-sm font-medium text-gray-900 underline underline-offset-2"
            >
              フードを追加する →
            </Link>
          </div>
        ) : (
          <form action={logFeeding} className="flex flex-col gap-8">
            <input type="hidden" name="memberId" value={member.id} />
            <input type="hidden" name="householdId" value={member.household_id} />
            <input type="hidden" name="catId" value={cat.id} />

            <div>
              <p className="mb-3 font-medium">フードの種類</p>
              <div className="flex flex-col gap-2">
                {foods.map((food, i) => (
                  <label key={food.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="foodType"
                      value={food.name}
                      defaultChecked={i === 0}
                      className="peer sr-only"
                    />
                    <span className="flex items-center justify-center rounded-xl border-2 border-gray-200 py-3 font-medium transition-colors peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white">
                      {food.name}
                    </span>
                  </label>
                ))}
              </div>
              <Link
                href={`/cats/${cat.id}/settings`}
                className="mt-3 block text-center text-sm text-gray-400 underline-offset-2 hover:underline"
              >
                + フードを追加・編集
              </Link>
            </div>

            <div>
              <p className="mb-1 font-medium">食べた量</p>
              <p className="mb-3 text-sm text-gray-400">任意</p>
              <div className="flex flex-col gap-2">
                {(
                  [
                    { value: "all", label: "完食" },
                    { value: "most", label: "ほぼ完食" },
                    { value: "half", label: "半分" },
                    { value: "little", label: "少し残した" },
                    { value: "none", label: "ほとんど食べず" },
                  ] as const
                ).map(({ value, label }) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="amount"
                      value={value}
                      className="peer sr-only"
                    />
                    <span className="flex items-center justify-center rounded-xl border-2 border-gray-200 py-3 font-medium transition-colors peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <SubmitButton
              label="ご飯をあげた"
              pendingLabel="記録中..."
              className="mt-4 w-full rounded-2xl bg-gray-900 py-5 text-xl font-bold text-white active:bg-gray-700 disabled:opacity-60"
            />
          </form>
        )}
      </div>
    </main>
  );
}
