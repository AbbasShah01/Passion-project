"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      const { client: supabase, error: clientError } = createSupabaseBrowserClient();
      if (!supabase) {
        setError(clientError);
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut();

      if (!signOutError) {
        router.push("/auth/login");
        router.refresh();
        return;
      }

      setError(signOutError.message);
    } catch {
      setError("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Logging out..." : "Logout"}
      </button>
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
