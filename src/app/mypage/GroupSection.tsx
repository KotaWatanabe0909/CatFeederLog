"use client";

import { useState, useTransition } from "react";
import { switchHousehold, deleteHousehold } from "./actions";

type Household = {
  household_id: string;
  householdName: string;
  memberCount: number;
  isOwner: boolean;
};

type Props = {
  households: Household[];
  activeHouseholdId: string;
};

export function GroupSection({ households, activeHouseholdId }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete(householdId: string) {
    const formData = new FormData();
    formData.set("householdId", householdId);
    setError(null);
    startTransition(async () => {
      const result = await deleteHousehold({}, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-900">グループ</p>
        <button
          onClick={() => { setEditing((v) => !v); setConfirmingId(null); setError(null); }}
          className="text-xs text-gray-900 underline underline-offset-2"
        >
          {editing ? "完了" : "編集"}
        </button>
      </div>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      {households.map((h) => (
        <div key={h.household_id} className="border-b border-gray-100 py-3 last:border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{h.householdName}</p>
              <p className="text-sm text-gray-900">{h.memberCount}人</p>
            </div>
            <div className="flex items-center gap-3">
              {editing && h.isOwner && confirmingId !== h.household_id && (
                <button
                  onClick={() => setConfirmingId(h.household_id)}
                  className="text-sm text-red-500 underline underline-offset-2"
                >
                  削除
                </button>
              )}
              {h.household_id === activeHouseholdId ? (
                <span className="text-xs font-medium text-gray-900">表示中</span>
              ) : (
                <form action={switchHousehold.bind(null, h.household_id)}>
                  <button className="text-sm text-gray-900 underline underline-offset-2">
                    切り替え
                  </button>
                </form>
              )}
            </div>
          </div>

          {confirmingId === h.household_id && (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="mb-3 text-sm text-gray-900">
                「{h.householdName}」を削除しますか？この操作は元に戻せません。
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(h.household_id)}
                  disabled={pending}
                  className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {pending ? "削除中..." : "削除する"}
                </button>
                <button
                  onClick={() => setConfirmingId(null)}
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-900"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
