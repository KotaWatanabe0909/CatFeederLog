"use client";

import { useState } from "react";
import { updateCatName } from "./actions";

type Props = { cat: { id: string; name: string } };

export function CatNameEditor({ cat }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form action={updateCatName} className="flex items-center gap-2 w-full">
        <input type="hidden" name="catId" value={cat.id} />
        <input
          name="name"
          defaultValue={cat.name}
          autoFocus
          required
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          保存
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500"
        >
          キャンセル
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <span className="font-medium">{cat.name}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm text-gray-400 hover:text-gray-700"
        >
          名前を変更
        </button>
      </div>
    </div>
  );
}
