"use client";

import { useActionState } from "react";
import { addCat } from "./actions";

const initialState: { error?: string } = {};

export function AddCatForm() {
  const [state, formAction, pending] = useActionState(addCat, initialState);

  return (
    <form action={formAction} className="flex gap-2">
      <input
        name="catName"
        required
        placeholder="名前を入力"
        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "..." : "追加"}
      </button>
      {state.error && (
        <p className="mt-2 text-sm text-red-500">{state.error}</p>
      )}
    </form>
  );
}
