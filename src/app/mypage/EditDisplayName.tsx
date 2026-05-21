"use client";

import { useTransition, useState } from "react";
import { updateDisplayName } from "./actions";

export function EditDisplayName({ current }: { current: string }) {
  const [displayName, setDisplayName] = useState(current);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("displayName") as string)?.trim();
    if (!name) return;

    setError(null);
    startTransition(async () => {
      const result = await updateDisplayName({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setDisplayName(name);
        setEditing(false);
      }
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{displayName}</span>
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-gray-900 underline underline-offset-2"
        >
          編集
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        name="displayName"
        defaultValue={displayName}
        required
        autoFocus
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-gray-900 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setError(null); }}
          className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-900"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
