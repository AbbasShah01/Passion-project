"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteIdea } from "@/app/actions/delete-idea";
import { deleteDemoIdea, getDemoIdeas } from "@/lib/demo-storage";
import { copyToClipboard } from "@/lib/utils";

type Platform = "instagram" | "tiktok" | "facebook";
type Category =
  | "cricket"
  | "politics"
  | "tv_shows"
  | "campus_humor"
  | "trending_audio";
type IdeaFormat = "static_image" | "video" | "text_only";

type IdeaRecord = {
  id: string;
  platform: Platform;
  category: Category;
  meme_text: string;
  caption: string;
  format: IdeaFormat;
  hashtags: string[];
  created_at: string;
};

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

type HistoryClientProps = {
  initialIdeas: IdeaRecord[];
  demoMode?: boolean;
};

const platformFilters: Array<{ value: "all" | Platform; label: string }> = [
  { value: "all", label: "All Platforms" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
];

const categoryFilters: Array<{ value: "all" | Category; label: string }> = [
  { value: "all", label: "All Categories" },
  { value: "cricket", label: "Cricket" },
  { value: "politics", label: "Politics" },
  { value: "tv_shows", label: "TV Shows" },
  { value: "campus_humor", label: "Campus Humor" },
  { value: "trending_audio", label: "Trending Audio" },
];

export default function HistoryClient({ initialIdeas, demoMode = false }: HistoryClientProps) {
  const [ideas, setIdeas] = useState<IdeaRecord[]>(initialIdeas);
  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | Category>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (demoMode) {
      setIdeas(getDemoIdeas());
    }
  }, [demoMode]);

  const showToast = (type: Toast["type"], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2600);
  };

  const visibleIdeas = useMemo(() => {
    const filtered = ideas.filter((idea) => {
      const platformMatch = platformFilter === "all" || idea.platform === platformFilter;
      const categoryMatch = categoryFilter === "all" || idea.category === categoryFilter;
      return platformMatch && categoryMatch;
    });

    return filtered.sort((a, b) => {
      const first = new Date(a.created_at).getTime();
      const second = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? second - first : first - second;
    });
  }, [ideas, platformFilter, categoryFilter, sortOrder]);

  const handleCopy = async (idea: IdeaRecord) => {
    const copied = await copyToClipboard(
      {
        meme_text: idea.meme_text,
        caption: idea.caption,
        hashtags: idea.hashtags,
      },
      showToast
    );

    if (copied) {
      setCopiedId(idea.id);
      setTimeout(() => setCopiedId(null), 1400);
    }
  };

  const handleDelete = async (ideaId: string) => {
    setDeletingIds((prev) => ({ ...prev, [ideaId]: true }));
    try {
      if (demoMode) {
        deleteDemoIdea(ideaId);
        setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
        showToast("success", "Idea deleted.");
        return;
      }

      const result = await deleteIdea(ideaId);

      if (!result.success) {
        showToast("error", result.message);
        return;
      }

      setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
      showToast("success", result.message);
    } catch {
      showToast("error", "Failed to delete idea. Please try again.");
    } finally {
      setDeletingIds((prev) => ({ ...prev, [ideaId]: false }));
    }
  };

  return (
    <section className="space-y-6">
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${
              toast.type === "success"
                ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-100"
                : "border-rose-400/60 bg-rose-500/20 text-rose-100"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">History</h2>
            <p className="mt-2 text-slate-300">Browse, copy, and manage your saved ideas.</p>
            {demoMode ? (
              <p className="mt-1 text-xs uppercase tracking-wide text-pink-200">
                Demo mode: ideas are stored in this browser only
              </p>
            ) : null}
          </div>
          <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-200">
            {visibleIdeas.length} shown
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as "all" | Platform)}
            className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-primary"
          >
            {platformFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as "all" | Category)}
            className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-primary"
          >
            {categoryFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-primary"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {visibleIdeas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-slate-900/40 px-4 py-12 text-center text-slate-300">
          No saved ideas yet. Generate and save ideas from your dashboard to see them here.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleIdeas.map((idea) => (
            <article
              key={idea.id}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg transition hover:-translate-y-1 hover:border-secondary/50 hover:shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">{idea.meme_text}</h3>
                <span className="rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-xs font-semibold uppercase text-purple-100">
                  {idea.format.replace("_", " ")}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-200">{idea.caption}</p>
              <p className="mt-3 text-sm text-pink-200">{idea.hashtags.join(" ")}</p>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="capitalize">{idea.platform}</span>
                <span className="capitalize">{idea.category.replace("_", " ")}</span>
                <span>{new Date(idea.created_at).toLocaleDateString()}</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleCopy(idea)}
                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  {copiedId === idea.id ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idea.id)}
                  disabled={deletingIds[idea.id]}
                  className="rounded-lg border border-rose-400/40 bg-rose-500/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingIds[idea.id] ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
