import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logFeeding } from "./actions";

export default async function RecordPage() {
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

  const { data: lastLog } = await supabase
    .from("feeding_logs")
    .select("food_type")
    .eq("household_id", member.household_id)
    .order("fed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const defaultFoodType = lastLog?.food_type ?? "dry";

  const { data: cat } = await supabase
    .from("cats")
    .select("id, name")
    .eq("household_id", member.household_id)
    .single();

  if (!cat) redirect("/onboarding");

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="text-gray-400">
            ← 戻る
          </Link>
          <h1 className="text-xl font-bold">給餌を記録</h1>
        </div>

        <form action={logFeeding} className="flex flex-col gap-8">
          <input type="hidden" name="memberId" value={member.id} />
          <input type="hidden" name="householdId" value={member.household_id} />
          <input type="hidden" name="catId" value={cat.id} />

          <div>
            <p className="mb-3 font-medium">フードの種類</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="foodType"
                  value="dry"
                  defaultChecked={defaultFoodType === "dry"}
                  className="peer sr-only"
                />
                <span className="flex items-center justify-center rounded-xl border-2 border-gray-200 py-4 font-medium transition-colors peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white">
                  ドライ
                </span>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="foodType"
                  value="wet"
                  defaultChecked={defaultFoodType === "wet"}
                  className="peer sr-only"
                />
                <span className="flex items-center justify-center rounded-xl border-2 border-gray-200 py-4 font-medium transition-colors peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white">
                  ウェット
                </span>
              </label>
            </div>
          </div>

          <div>
            <p className="mb-1 font-medium">食べた量</p>
            <p className="mb-3 text-sm text-gray-400">任意</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="amount"
                  value="finished"
                  className="peer sr-only"
                />
                <span className="flex items-center justify-center rounded-xl border-2 border-gray-200 py-4 font-medium transition-colors peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white">
                  完食
                </span>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="amount"
                  value="leftover"
                  className="peer sr-only"
                />
                <span className="flex items-center justify-center rounded-xl border-2 border-gray-200 py-4 font-medium transition-colors peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white">
                  残した
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-gray-900 py-5 text-xl font-bold text-white active:bg-gray-700"
          >
            給餌した
          </button>
        </form>
      </div>
    </main>
  );
}
