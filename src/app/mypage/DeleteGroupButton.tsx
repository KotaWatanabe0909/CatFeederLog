"use client";

import { useActionState, useState } from "react";
import { deleteHousehold } from "./actions";

type Props = {
  householdId: string;
  householdName: string;
};

export function DeleteGroupButton({ householdId, householdName }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(deleteHousehold, {});

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-red-500 underline underline-offset-2"
      >
        削除
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
      <p className="mb-3 text-sm text-gray-900">
        「{householdName}」を削除しますか？この操作は元に戻せません。
      </p>
      {state.error && (
        <p className="mb-2 text-sm text-red-600">{state.error}</p>
      )}
      <div className="flex gap-2">
        <form action={action} className="flex-1">
          <input type="hidden" name="householdId" value={householdId} />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-red-500 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "削除中..." : "削除する"}
          </button>
        </form>
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-900"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
