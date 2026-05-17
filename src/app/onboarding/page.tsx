import { createHousehold } from "./actions";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-2 text-2xl font-bold">CatFeederLog へようこそ</h1>
      <p className="mb-8 text-gray-500">まず世帯と猫の情報を登録してください</p>

      <form action={createHousehold} className="flex w-full max-w-sm flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">あなたの表示名</label>
          <input
            name="displayName"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            placeholder="例: お父さん"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">世帯名</label>
          <input
            name="householdName"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            placeholder="例: 渡辺家"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">猫の名前</label>
          <input
            name="catName"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            placeholder="例: ムギ"
          />
        </div>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-gray-900 px-6 py-3 text-white hover:bg-gray-700"
        >
          はじめる
        </button>
      </form>
    </main>
  );
}
