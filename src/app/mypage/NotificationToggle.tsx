"use client";

import { useEffect, useState } from "react";

type Status = "loading" | "unsupported" | "on" | "off";

export function NotificationToggle() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    async function checkStatus() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? "on" : "off");
    }

    void checkStatus();
  }, []);

  async function handleToggle() {
    const reg = await navigator.serviceWorker.ready;

    if (status === "on") {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push-unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("off");
    } else {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      });
      const json = sub.toJSON();
      await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      setStatus("on");
    }
  }

  if (status === "unsupported") {
    return <p className="text-sm text-gray-900">このブラウザは通知に対応していません</p>;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={status === "loading"}
      className="flex w-full items-center justify-between disabled:opacity-50"
    >
      <span className="text-sm text-gray-900">
        {status === "on" ? "オン" : status === "off" ? "オフ" : "確認中..."}
      </span>
      <div
        className={`relative h-6 w-11 rounded-full transition-colors ${
          status === "on" ? "bg-gray-900" : "bg-gray-200"
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            status === "on" ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
