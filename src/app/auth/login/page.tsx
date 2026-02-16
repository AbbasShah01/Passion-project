"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { isDemoModeClient } from "@/lib/runtime-config";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoMode = isDemoModeClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const callbackError = searchParams.get("error");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const { client: supabase, error: clientError } = createSupabaseBrowserClient();
      if (!supabase) {
        setError(clientError);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.4),transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(236,72,153,0.35),transparent_45%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-200">Log in to access your idea dashboard.</p>
        {demoMode ? (
          <p className="mt-2 text-xs uppercase tracking-wide text-pink-200">
            Demo mode active: authentication is optional
          </p>
        ) : null}

        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-100" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:border-primary focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-100" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:border-primary focus:outline-none"
              placeholder="Your password"
            />
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {!error && callbackError ? (
            <p className="text-sm text-red-300">{decodeURIComponent(callbackError)}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-200">
          Need an account?{" "}
          <Link className="font-semibold text-pink-300 hover:text-pink-200" href="/auth/signup">
            Sign up
          </Link>
        </p>
        {demoMode ? (
          <Link
            className="mt-3 inline-block text-sm font-semibold text-purple-200 hover:text-purple-100"
            href="/dashboard"
          >
            Continue in Demo Mode
          </Link>
        ) : null}
      </div>
    </main>
  );
}
