"use server";

import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export type DeleteIdeaResult = {
  success: boolean;
  message: string;
};

export async function deleteIdea(ideaId: string): Promise<DeleteIdeaResult> {
  try {
    if (!ideaId || typeof ideaId !== "string") {
      return { success: false, message: "Invalid idea id." };
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
      return { success: false, message: "You must be logged in to delete ideas." };
    }

    const { error } = await supabase
      .from("ideas")
      .delete()
      .eq("id", ideaId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Idea deleted." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: `Failed to delete idea: ${message}` };
  }
}
