import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { updateFeeding } from "./actions";

export default async function EditFeedingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: log } = await supabase
    .from("feeding_logs")
    .select("id, food_type, amount, member_id")
    .eq("id", id)
    .eq("household_id", member.household_id)
    .single();

  if (!log) notFound();

  // only the recorder can edit
  if (log.member_id !== member.id) redirect("/");

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="text-gray-400">
            ← 戻る
          </Link>
          <h1 className="text-xl font-bold">記録を編集</h1>
        </div>

        <form action={updateFeeding} className="flex flex-col gap-8">
          <input type="hidden" name="id" value={log.id} />

          <div>
            <p className="mb-3 font-medium">フードの種類</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="foodType"
                  value="dry"
                  defaultChecked={log.food_type === "dry"}
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
                  defaultChecked={log.food_type === "wet"}
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
                    defaultChecked={log.amount === value}
                    className="peer sr-only"
                  />
                  <span className="flex items-center justify-center rounded-xl border-2 border-gray-200 py-3 font-medium transition-colors peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-gray-900 py-5 text-xl font-bold text-white active:bg-gray-700"
          >
            保存
          </button>
        </form>
      </div>
    </main>
  );
}
