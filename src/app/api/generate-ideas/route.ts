import { NextResponse } from "next/server";
import { hasAnthropicEnv, isDemoModeServer } from "@/lib/runtime-config";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type Platform = "instagram" | "tiktok" | "facebook";
type Category =
  | "cricket"
  | "politics"
  | "tv_shows"
  | "campus_humor"
  | "trending_audio";
type IdeaFormat = "static_image" | "video" | "text_only";

type Idea = {
  meme_text: string;
  caption: string;
  format: IdeaFormat;
  hashtags: string[];
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
const FORMAT_ROTATION: IdeaFormat[] = ["static_image", "video", "text_only"];

const categoryPrompts: Record<Category, string[]> = {
  cricket: [
    "When your team needs 6 off 1 and everyone becomes a cricket professor.",
    "POV: You said easy win before the toss.",
    "That one friend celebrates every dot ball like a trophy moment.",
  ],
  politics: [
    "Manifesto promises vs week-one reality.",
    "Debate night: long speeches, zero answers.",
    "When the spokesperson says let me clarify for the ninth time.",
  ],
  tv_shows: [
    "Final episode twist nobody expected but everyone posted.",
    "Me explaining side characters like family members.",
    "New season dropped, productivity disappeared.",
  ],
  campus_humor: [
    "Group project: one worker and four supervisors.",
    "Attendance at 74.9% and sudden life crisis.",
    "Library during exams: silent panic everywhere.",
  ],
  trending_audio: [
    "Using one trending sound for every life problem.",
    "When the beat drops exactly when confidence drops.",
    "Open app, same viral audio finds you again.",
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractJsonArrayFromText(text: string): unknown {
  const fenced = text.match(/```json\\s*([\\s\\S]*?)```/i);
  const candidate = fenced?.[1] ?? text;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("[");
    const end = candidate.lastIndexOf("]");

    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }

    throw new Error("Could not parse model response as JSON array.");
  }
}

function validateIdeas(value: unknown): Idea[] {
  if (!Array.isArray(value)) {
    throw new Error("Model response must be a JSON array.");
  }

  if (value.length !== 5) {
    throw new Error("Model response must contain exactly 5 ideas.");
  }

  const ideas = value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Idea ${index + 1} is not an object.`);
    }

    const memeText = item.meme_text;
    const caption = item.caption;
    const format = item.format;
    const hashtags = item.hashtags;

    if (typeof memeText !== "string" || memeText.trim().length === 0) {
      throw new Error(`Idea ${index + 1} has invalid meme_text.`);
    }

    if (typeof caption !== "string" || caption.trim().length === 0) {
      throw new Error(`Idea ${index + 1} has invalid caption.`);
    }

    if (typeof format !== "string" || !ALLOWED_FORMATS.includes(format as IdeaFormat)) {
      throw new Error(`Idea ${index + 1} has invalid format.`);
    }

    if (!Array.isArray(hashtags) || !hashtags.every((tag) => typeof tag === "string")) {
      throw new Error(`Idea ${index + 1} has invalid hashtags.`);
    }

    return {
      meme_text: memeText.trim(),
      caption: caption.trim(),
      format: format as IdeaFormat,
      hashtags: hashtags.map((tag) => tag.trim()).filter(Boolean),
    };
  });

  return ideas;
}

function generateDemoIdeas(platform: Platform, category: Category): Idea[] {
  const pool = categoryPrompts[category];

  return Array.from({ length: 5 }).map((_, index) => {
    const seed = (index + platform.length + category.length) % pool.length;
    const text = pool[seed];
    return {
      meme_text: text,
      caption: `${text} ${platform === "tiktok" ? "Drop your version." : "Tag your friends."}`,
      format: FORMAT_ROTATION[index % FORMAT_ROTATION.length],
      hashtags: [`#${platform}`, `#${category.replace("_", "")}`, "#memepk", "#trendgenerator"],
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { platform?: unknown; category?: unknown };
    const platform = body.platform;
    const category = body.category;

    if (typeof platform !== "string" || !ALLOWED_PLATFORMS.includes(platform as Platform)) {
      return NextResponse.json(
        { error: "Invalid platform. Expected instagram, tiktok, or facebook." },
        { status: 400 }
      );
    }

    if (typeof category !== "string" || !ALLOWED_CATEGORIES.includes(category as Category)) {
      return NextResponse.json(
        {
          error:
            "Invalid category. Expected cricket, politics, tv_shows, campus_humor, or trending_audio.",
        },
        { status: 400 }
      );
    }

    const demoMode = isDemoModeServer();
    if (!demoMode) {
      const supabase = createSupabaseServerClient();
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError) {
        return NextResponse.json({ error: "Unable to verify authentication." }, { status: 500 });
      }

      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (!hasAnthropicEnv()) {
      return NextResponse.json({ ideas: generateDemoIdeas(platform as Platform, category as Category) }, { status: 200 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY as string;

    const prompt = `You are a Pakistani social media content expert who creates viral meme concepts.
Create exactly 5 unique ideas for platform "${platform}" in category "${category}".
Keep language natural for Pakistan-based social audiences.
Return ONLY valid JSON (no markdown, no extra text) as an array of 5 objects.
Each object must use this exact schema:
{
  "meme_text": "string",
  "caption": "string",
  "format": "static_image" | "video" | "text_only",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1200,
        temperature: 0.8,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      return NextResponse.json(
        { error: "Failed to generate ideas from AI provider.", details: errorBody },
        { status: 502 }
      );
    }

    const raw = (await anthropicResponse.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };

    const textOutput =
      raw.content?.find((chunk) => chunk.type === "text" && typeof chunk.text === "string")?.text ?? "";

    if (!textOutput) {
      return NextResponse.json(
        { error: "AI provider returned an empty response." },
        { status: 502 }
      );
    }

    const parsed = extractJsonArrayFromText(textOutput);
    const ideas = validateIdeas(parsed);

    return NextResponse.json({ ideas }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to generate ideas.", details: message }, { status: 500 });
  }
}
