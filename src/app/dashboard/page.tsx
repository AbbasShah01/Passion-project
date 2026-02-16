"use client";

import { useState } from "react";
import { saveIdea } from "@/app/actions/save-idea";
import { saveDemoIdea } from "@/lib/demo-storage";
import { isDemoModeClient } from "@/lib/runtime-config";
import { copyToClipboard } from "@/lib/utils";

type Platform = "instagram" | "tiktok" | "facebook";
type Category =
  | "cricket"
  | "politics"
  | "tv_shows"
  | "campus_humor"
  | "trending_audio";
type IdeaFormat = "static_image" | "video" | "text_only";

type Idea = {
  id: string;
  platform: Platform;
  category: Category;
  memeText: string;
  caption: string;
  format: IdeaFormat;
  hashtags: string[];
};

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

type GeneratedIdea = {
  meme_text: string;
  caption: string;
  format: IdeaFormat;
  hashtags: string[];
};

const platformOptions: Array<{ id: Platform; label: string; icon: string }> = [
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "facebook", label: "Facebook", icon: "👥" },
];

const categoryOptions: Array<{ id: Category; label: string }> = [
  { id: "cricket", label: "Cricket" },
  { id: "politics", label: "Politics" },
  { id: "tv_shows", label: "TV Shows" },
  { id: "campus_humor", label: "Campus Humor" },
  { id: "trending_audio", label: "Trending Audio" },
];

export default function DashboardPage() {
  const demoMode = isDemoModeClient();
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [category, setCategory] = useState<Category>("cricket");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: Toast["type"], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2600);
  };

  const generateIdeas = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform, category }),
      });

      const payload = (await response.json()) as {
        ideas?: GeneratedIdea[];
        error?: string;
        details?: string;
      };

      if (!response.ok) {
        const errorMessage = payload.error ?? payload.details ?? "Could not generate ideas.";
        showToast("error", errorMessage);
        return;
      }

      const generated = (payload.ideas ?? []).map((idea, index) => ({
        id: `${Date.now()}-${index}`,
        platform,
        category,
        memeText: idea.meme_text,
        caption: idea.caption,
        format: idea.format,
        hashtags: idea.hashtags,
      }));

      setIdeas(generated);
      setCopiedId(null);
      setSavedIds({});
      setSavingIds({});
      showToast("success", "Ideas generated successfully.");
    } catch {
      showToast("error", "Failed to generate ideas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyIdea = async (idea: Idea) => {
    const copied = await copyToClipboard(
      {
        meme_text: idea.memeText,
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

  const saveIdeaToDb = async (idea: Idea) => {
      setSavingIds((prev) => ({ ...prev, [idea.id]: true }));

    try {
      if (demoMode) {
        saveDemoIdea({
          platform: idea.platform,
          category: idea.category,
          meme_text: idea.memeText,
          caption: idea.caption,
          hashtags: idea.hashtags,
          format: idea.format,
        });
        setSavedIds((prev) => ({ ...prev, [idea.id]: true }));
        showToast("success", "Idea saved in demo mode.");
        return;
      }

      const result = await saveIdea({
        platform: idea.platform,
        category: idea.category,
        meme_text: idea.memeText,
        caption: idea.caption,
        hashtags: idea.hashtags,
        format: idea.format,
      });

      if (result.success) {
        setSavedIds((prev) => ({ ...prev, [idea.id]: true }));
        showToast("success", result.message);
        return;
      }

      showToast("error", result.message);
    } catch {
      showToast("error", "Failed to save idea. Please try again.");
    } finally {
      setSavingIds((prev) => ({ ...prev, [idea.id]: false }));
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
        <h2 className="text-2xl font-bold">Generate Meme Ideas</h2>
        <p className="mt-2 text-slate-300">
          Pick a platform and category, then generate ready-to-post concepts.
        </p>
        {demoMode ? (
          <p className="mt-2 text-xs uppercase tracking-wide text-pink-200">
            Demo mode active: save/history are local to this browser
          </p>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">Platform</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {platformOptions.map((option) => (
                <label
                  key={option.id}
                  className={`cursor-pointer rounded-xl border px-4 py-3 transition ${
                    platform === option.id
                      ? "border-primary bg-primary/20 text-white shadow-lg shadow-primary/20"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-secondary/50 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value={option.id}
                    checked={platform === option.id}
                    onChange={() => setPlatform(option.id)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-3 block text-sm font-semibold uppercase tracking-wide text-slate-200"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white shadow-inner outline-none transition focus:border-primary"
            >
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={generateIdeas}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-primary via-violet-600 to-secondary px-6 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Generating 5 ideas..." : "Generate Ideas"}
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Results</h3>
          {ideas.length > 0 ? <span className="text-sm text-slate-300">{ideas.length} ideas generated</span> : null}
        </div>

        {ideas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 bg-slate-900/40 px-4 py-10 text-center text-slate-300">
            No ideas yet. Click <span className="font-semibold text-white">Generate Ideas</span> to get started.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {ideas.map((idea) => (
              <article
                key={idea.id}
                className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg transition hover:-translate-y-1 hover:border-secondary/50 hover:shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-lg font-semibold text-white">{idea.memeText}</h4>
                  <span className="rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-xs font-semibold uppercase text-purple-100">
                    {idea.format.replace("_", " ")}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-200">{idea.caption}</p>
                <p className="mt-3 text-sm text-pink-200">{idea.hashtags.join(" ")}</p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => copyIdea(idea)}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                  >
                    {copiedId === idea.id ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => saveIdeaToDb(idea)}
                    disabled={savingIds[idea.id] || savedIds[idea.id]}
                    className="rounded-lg border border-secondary/40 bg-secondary/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-secondary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingIds[idea.id] ? "Saving..." : savedIds[idea.id] ? "Saved" : "Save"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
