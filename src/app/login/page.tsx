"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
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
