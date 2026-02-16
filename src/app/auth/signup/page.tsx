"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isDemoModeClient } from "@/lib/runtime-config";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();
  const demoMode = isDemoModeClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { client: supabase, error: clientError } = createSupabaseBrowserClient();
      if (!supabase) {
        setError(clientError);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session || data.user) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setError("Signup succeeded. Please check your email to confirm your account.");
    } catch {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.35),transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.35),transparent_45%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-200">Sign up to start generating trending meme ideas.</p>
        {demoMode ? (
          <p className="mt-2 text-xs uppercase tracking-wide text-pink-200">
            Demo mode active: you can skip signup for now
          </p>
        ) : null}

        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:border-primary focus:outline-none"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-100" htmlFor="confirm-password">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:border-primary focus:outline-none"
              placeholder="Re-enter password"
            />
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-200">
          Already have an account?{" "}
          <Link className="font-semibold text-pink-300 hover:text-pink-200" href="/auth/login">
            Log in
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
