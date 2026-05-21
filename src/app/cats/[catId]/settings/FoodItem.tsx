"use client";

import { useState } from "react";
import { updateFood, deleteFood } from "./actions";

type Food = { id: string; name: string; catId: string };

export function FoodItem({ food }: { food: Food }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form action={updateFood} className="flex items-center gap-2">
        <input type="hidden" name="id" value={food.id} />
        <input type="hidden" name="catId" value={food.catId} />
        <input
          name="name"
          defaultValue={food.name}
          autoFocus
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white"
        >
          保存
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500"
        >
          キャンセル
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="font-medium">{food.name}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm text-gray-400 hover:text-gray-700"
        >
          編集
        </button>
        <form action={deleteFood}>
          <input type="hidden" name="id" value={food.id} />
          <input type="hidden" name="catId" value={food.catId} />
          <button
            type="submit"
            onClick={(e) => {
              if (!confirm(`「${food.name}」を削除しますか？`))
                e.preventDefault();
            }}
            className="text-sm text-red-400 hover:text-red-600"
          >
            削除
          </button>
        </form>
      </div>
    </div>
  );
}
