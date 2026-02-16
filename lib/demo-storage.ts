export type DemoIdea = {
  id: string;
  platform: "instagram" | "tiktok" | "facebook";
  category: "cricket" | "politics" | "tv_shows" | "campus_humor" | "trending_audio";
  meme_text: string;
  caption: string;
  format: "static_image" | "video" | "text_only";
  hashtags: string[];
  created_at: string;
};

const KEY = "trend_generator_demo_ideas";

function safeParse(value: string | null): DemoIdea[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as DemoIdea[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getDemoIdeas(): DemoIdea[] {
  if (typeof window === "undefined") {
    return [];
  }

  return safeParse(window.localStorage.getItem(KEY));
}

export function saveDemoIdea(idea: Omit<DemoIdea, "id" | "created_at">): DemoIdea {
  if (typeof window === "undefined") {
    throw new Error("Demo storage is only available in the browser.");
  }

  const ideas = getDemoIdeas();
  const created: DemoIdea = {
    ...idea,
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
  };

  window.localStorage.setItem(KEY, JSON.stringify([created, ...ideas]));
  return created;
}

export function deleteDemoIdea(id: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const ideas = getDemoIdeas();
  window.localStorage.setItem(
    KEY,
    JSON.stringify(ideas.filter((idea) => idea.id !== id))
  );
}
