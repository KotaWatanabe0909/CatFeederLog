"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

type Props = {
  catId: string;
  catName: string;
};

export function CatQRButton({ catId, catName }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [recordUrl, setRecordUrl] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRecordUrl(`${window.location.origin}/record?catId=${catId}`);
    });
    return () => cancelAnimationFrame(frame);
  }, [catId]);

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-sm text-gray-900 underline-offset-2 hover:underline"
      >
        {expanded ? "QRを閉じる" : "QRコード"}
      </button>
      {expanded && recordUrl && (
        <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-900">{catName}のQRコード</p>
          <QRCodeSVG value={recordUrl} size={180} />
          <p className="break-all text-center text-xs text-gray-900">{recordUrl}</p>
          <button
            onClick={() => window.print()}
            className="w-full rounded-xl border-2 border-gray-900 py-3 text-sm font-medium"
          >
            印刷する
          </button>
        </div>
      )}
    </div>
  );
}
