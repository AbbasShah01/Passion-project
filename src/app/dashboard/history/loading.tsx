export default function HistoryLoading() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-xl backdrop-blur">
      <div className="h-6 w-28 animate-pulse rounded bg-white/15" />
      <div className="mt-4 h-4 w-64 animate-pulse rounded bg-white/10" />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="h-44 animate-pulse rounded-xl bg-white/10" />
        <div className="h-44 animate-pulse rounded-xl bg-white/10" />
      </div>
    </section>
  );
}
