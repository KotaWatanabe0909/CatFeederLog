"use client";

import { useActionState } from "react";
import { createHousehold } from "./actions";

export default function OnboardingPage() {
  const [state, action, pending] = useActionState(createHousehold, {});

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">新しいグループを作成</h1>
      <p className="mb-8 text-gray-900">グループと猫の情報を登録してください</p>

      <form action={action} className="flex w-full max-w-sm flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">あなたの表示名</label>
          <input
            name="displayName"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
            placeholder="例: お父さん"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">グループ名</label>
          <input
            name="householdName"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
            placeholder="例: 渡辺家"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">猫の名前</label>
          <input
            name="catName"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
            placeholder="例: ムギ"
          />
        </div>
        {state.error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-gray-900 px-6 py-3 text-white disabled:opacity-50"
        >
          {pending ? "作成中..." : "作成する"}
        </button>
      </form>
    </main>
  );
}
