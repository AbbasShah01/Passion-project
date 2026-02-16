"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur">
            <h2 className="text-2xl font-bold">Critical application error</h2>
            <p className="mt-3 text-sm text-slate-200">{error.message || "Something went wrong."}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
