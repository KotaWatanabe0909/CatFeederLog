"use client";

import { useState } from "react";
import { createInvite } from "./actions";

export function InviteSection() {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const result = await createInvite();
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    const url = `${window.location.origin}/invite/${result.token}`;
    setInviteUrl(url);
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {!inviteUrl ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-xl border-2 border-gray-200 py-4 font-medium transition-colors hover:border-gray-400 disabled:opacity-50"
        >
          {loading ? "生成中..." : "招待リンクを生成"}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="break-all rounded-xl bg-white p-3 text-sm text-gray-900 shadow-sm">
            {inviteUrl}
          </p>
          <button
            onClick={handleCopy}
            className="w-full rounded-xl bg-gray-900 py-4 font-medium text-white active:bg-gray-700"
          >
            {copied ? "コピーしました" : "リンクをコピー"}
          </button>
          <button
            onClick={() => { setInviteUrl(null); setCopied(false); }}
            className="text-sm text-gray-900"
          >
            別のリンクを生成
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <p className="mt-3 text-xs text-gray-900">有効期限: 7日間</p>
    </div>
  );
}
