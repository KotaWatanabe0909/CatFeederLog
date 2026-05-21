"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";

  const handleGoogleLogin = async () => {
    const callbackUrl = next
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-8 text-2xl font-bold">CatFeederLog</h1>
      <button
        onClick={handleGoogleLogin}
        className="rounded-lg bg-white px-6 py-3 text-gray-800 shadow-md hover:shadow-lg border border-gray-200"
      >
        Google でログイン
      </button>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
