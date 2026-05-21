"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export function QRSection() {
  const [recordUrl, setRecordUrl] = useState<string>("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRecordUrl(`${window.location.origin}/record`);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!recordUrl) return null;

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-sm">
      <QRCodeSVG value={recordUrl} size={200} />
      <p className="break-all text-center text-sm text-gray-900">{recordUrl}</p>
      <button
        onClick={() => window.print()}
        className="w-full rounded-xl border-2 border-gray-900 py-3 font-medium"
      >
        印刷する
      </button>
    </div>
  );
}
