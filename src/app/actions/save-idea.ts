"use server";

import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type Platform = "instagram" | "tiktok" | "facebook";
type Category =
  | "cricket"
  | "politics"
  | "tv_shows"
  | "campus_humor"
  | "trending_audio";
type IdeaFormat = "static_image" | "video" | "text_only";

export type SaveIdeaInput = {
  platform: Platform;
  category: Category;
  meme_text: string;
  caption: string;
  hashtags: string[];
  format: IdeaFormat;
};

export type SaveIdeaResult = {
  success: boolean;
  message: string;
};

const ALLOWED_PLATFORMS: Platform[] = ["instagram", "tiktok", "facebook"];
const ALLOWED_CATEGORIES: Category[] = [
  "cricket",
  "politics",
  "tv_shows",
  "campus_humor",
  "trending_audio",
];
const ALLOWED_FORMATS: IdeaFormat[] = ["static_image", "video", "text_only"];

function normalizeHashtags(tags: string[]) {
  return tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
}

export async function saveIdea(input: SaveIdeaInput): Promise<SaveIdeaResult> {
  try {
    if (!ALLOWED_PLATFORMS.includes(input.platform)) {
      return { success: false, message: "Invalid platform." };
    }

    if (!ALLOWED_CATEGORIES.includes(input.category)) {
      return { success: false, message: "Invalid category." };
    }

    if (!ALLOWED_FORMATS.includes(input.format)) {
      return { success: false, message: "Invalid format." };
    }

    if (!input.meme_text.trim() || !input.caption.trim()) {
      return { success: false, message: "Meme text and caption are required." };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, message: "Supabase environment variables are missing." };
    }

    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, message: "You must be logged in to save ideas." };
    }

    const { error: insertError } = await supabase.from("ideas").insert({
      user_id: user.id,
      platform: input.platform,
      category: input.category,
      meme_text: input.meme_text.trim(),
      caption: input.caption.trim(),
      hashtags: normalizeHashtags(input.hashtags),
      format: input.format,
    });

    if (insertError) {
      return { success: false, message: insertError.message };
    }

    return { success: true, message: "Idea saved successfully." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Failed to save idea: ${message}` };
  }
}
