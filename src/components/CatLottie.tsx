"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export function CatLottie({ className }: { className?: string }) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    fetch("/cat-lottie.json")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;
  return <Lottie animationData={data} loop className={className} />;
}
