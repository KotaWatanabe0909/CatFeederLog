"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { updateCatName, deleteCat } from "./actions";

type Cat = { id: string; name: string };
type State = "idle" | "editing" | "qr" | "deleting";

export function CatItem({ cat }: { cat: Cat }) {
  const [state, setState] = useState<State>("idle");
  const [deleteInput, setDeleteInput] = useState("");
  const [recordUrl, setRecordUrl] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRecordUrl(`${window.location.origin}/record?catId=${cat.id}`);
    });
    return () => cancelAnimationFrame(frame);
  }, [cat.id]);

  const reset = () => {
    setState("idle");
    setDeleteInput("");
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      {/* 名前 */}
      {state === "editing" ? (
        <form action={updateCatName} className="mb-3 flex items-center gap-2">
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
            onClick={reset}
            className="text-sm text-gray-400"
          >
            キャンセル
          </button>
        </form>
      ) : (
        <p className="mb-3 font-semibold">{cat.name}</p>
      )}

      {/* アクションバー */}
      {state === "idle" && (
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => setState("qr")}
            className="text-gray-500 hover:text-gray-900"
          >
            QRコード
          </button>
          <button
            type="button"
            onClick={() => setState("editing")}
            className="text-gray-500 hover:text-gray-900"
          >
            名前を変更
          </button>
          <button
            type="button"
            onClick={() => setState("deleting")}
            className="text-red-400 hover:text-red-600"
          >
            削除
          </button>
        </div>
      )}

      {/* QRコード */}
      {state === "qr" && recordUrl && (
        <div className="flex flex-col items-center gap-4 pt-2">
          <QRCodeSVG value={recordUrl} size={180} />
          <p className="break-all text-center text-xs text-gray-400">
            {recordUrl}
          </p>
          <div className="flex w-full gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700"
            >
              印刷する
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-xl bg-gray-100 py-2 text-sm font-medium text-gray-500"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 削除確認 */}
      {state === "deleting" && (
        <div className="mt-1 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="mb-2 text-xs text-red-600">
            削除後も設定から復元できます。
            <br />
            確認のため「<strong>{cat.name}</strong>」と入力してください。
          </p>
          <form action={deleteCat} className="flex gap-2">
            <input type="hidden" name="catId" value={cat.id} />
            <input
              name="confirmName"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder={cat.name}
              className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <button
              type="submit"
              disabled={deleteInput !== cat.name}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
            >
              削除する
            </button>
          </form>
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-xs text-gray-400"
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  );
}
