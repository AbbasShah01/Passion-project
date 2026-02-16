import { redirect } from "next/navigation";
import { isDemoModeServer } from "@/lib/runtime-config";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import HistoryClient from "./history-client";

type IdeaRecord = {
  id: string;
  platform: "instagram" | "tiktok" | "facebook";
  category: "cricket" | "politics" | "tv_shows" | "campus_humor" | "trending_audio";
  meme_text: string;
  caption: string;
  format: "static_image" | "video" | "text_only";
  hashtags: string[];
  created_at: string;
};

export default async function HistoryPage() {
  const demoMode = isDemoModeServer();

  if (demoMode) {
    return <HistoryClient initialIdeas={[]} demoMode />;
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("ideas")
    .select("id, platform, category, meme_text, caption, format, hashtags, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
        <h2 className="text-2xl font-bold">History</h2>
        <p className="mt-3 text-rose-300">Failed to load ideas: {error.message}</p>
      </section>
    );
  }

  return <HistoryClient initialIdeas={(data ?? []) as IdeaRecord[]} demoMode={false} />;
}
