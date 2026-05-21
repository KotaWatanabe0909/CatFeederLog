"use client";

import { useTransition, useState } from "react";
import { updateHouseholdName } from "./actions";

type Props = {
  current: string;
  isOwner: boolean;
};

export function EditHouseholdName({ current, isOwner }: Props) {
  const [householdName, setHouseholdName] = useState(current);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isOwner) {
    return <p className="font-medium text-gray-900">{householdName}</p>;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("householdName") as string)?.trim();
    if (!name) return;

    setError(null);
    startTransition(async () => {
      const result = await updateHouseholdName({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setHouseholdName(name);
        setEditing(false);
      }
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{householdName}</span>
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
        name="householdName"
        defaultValue={householdName}
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
