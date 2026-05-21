import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { joinHousehold } from "./actions";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/invite/${token}`);

  // already in a household
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (existing) redirect("/");

  // validate invite exists and is valid
  const { data: invite } = await supabase
    .from("invites")
    .select("id")
    .eq("token", token)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!invite) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md text-center">
          <p className="mb-2 text-lg font-semibold">招待リンクが無効です</p>
          <p className="text-sm text-gray-500">
            リンクの有効期限が切れているか、すでに使用されています。
          </p>
        </div>
      </main>
    );
  }

  const joinAction = joinHousehold.bind(null, token);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md text-center">
        <p className="mb-2 text-2xl font-bold">招待されています</p>
        <p className="mb-8 text-gray-500">
          このボタンを押すと世帯に参加します。
        </p>
        <form action={joinAction}>
          <button
            type="submit"
            className="w-full rounded-2xl bg-gray-900 py-5 text-xl font-bold text-white active:bg-gray-700"
          >
            参加する
          </button>
        </form>
      </div>
    </main>
  );
}
