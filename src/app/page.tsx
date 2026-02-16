import Link from "next/link";

const features = [
  {
    title: "Localized Meme Ideas",
    description: "Generate Pakistan-first meme concepts tailored to your audience and platform.",
  },
  {
    title: "One-Click Save",
    description: "Save your best ideas to your private dashboard history with secure user-level access.",
  },
  {
    title: "Instant Copy Format",
    description: "Copy ready-to-post meme text, caption, and hashtags in a clean creator format.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 py-20 sm:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.32),transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.26),transparent_45%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">AI Meme Studio</p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Trend Generator for Pakistani Social Media Creators
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-200 sm:text-lg">
              Generate platform-ready meme concepts, captions, and hashtag packs for Instagram,
              TikTok, and Facebook in seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:opacity-90"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl backdrop-blur">
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <p className="text-sm font-semibold text-slate-100">Live Preview</p>
                <span className="rounded-full bg-primary/25 px-3 py-1 text-xs text-purple-100">
                  Dashboard Mock
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-sm font-medium text-white">
                    &quot;When your team needs 6 off 1 and you open calculator mode.&quot;
                  </p>
                  <p className="mt-2 text-xs text-pink-200">#cricket #memepk #trendgenerator</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-sm font-medium text-white">
                    &quot;POV: campus attendance at 74.9% and your soul leaves body.&quot;
                  </p>
                  <p className="mt-2 text-xs text-pink-200">#campushumor #viralcontent #memepk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 sm:px-10">
        <h2 className="text-2xl font-bold sm:text-3xl">Features</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg transition hover:-translate-y-1 hover:border-secondary/40"
            >
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
