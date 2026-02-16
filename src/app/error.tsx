"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="mt-3 text-sm text-slate-200">An unexpected error occurred. Please try again.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
