"use client";

import { deleteFeeding } from "./actions";

export function DeleteButton({ id, catId }: { id: string; catId: string }) {
  return (
    <form action={deleteFeeding}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="catId" value={catId} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("この記録を削除しますか？")) e.preventDefault();
        }}
        className="w-full rounded-2xl border-2 border-red-200 py-4 font-medium text-red-500 active:bg-red-50"
      >
        削除
      </button>
    </form>
  );
}
