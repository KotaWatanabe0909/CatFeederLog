"use client";

import { useState } from "react";
import { deleteCat } from "./actions";

export function DeleteCatButton({ cat }: { cat: { id: string; name: string } }) {
  const [confirming, setConfirming] = useState(false);
  const [input, setInput] = useState("");

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-red-400 hover:text-red-600"
      >
        削除
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
      <p className="mb-2 text-xs text-red-600">
        削除後も設定から復元できます。
        <br />
        確認のため「<strong>{cat.name}</strong>」と入力してください。
      </p>
      <form action={deleteCat} className="flex flex-col gap-2">
        <input type="hidden" name="catId" value={cat.id} />
        <div className="flex gap-2">
          <input
            name="confirmName"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={cat.name}
            className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <button
            type="submit"
            disabled={input !== cat.name}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            削除する
          </button>
        </div>
        <button
          type="button"
          onClick={() => { setConfirming(false); setInput(""); }}
          className="text-xs text-gray-400"
        >
          キャンセル
        </button>
      </form>
    </div>
  );
}
