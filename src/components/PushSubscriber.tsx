"use client";

import { useEffect } from "react";

export function PushSubscriber() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    async function subscribe() {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        }));

      const json = sub.toJSON();
      await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
    }

    subscribe();
  }, []);

  return null;
}
