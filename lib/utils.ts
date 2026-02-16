export type ToastHandler = (type: "success" | "error", message: string) => void;

export type CopyableIdea = {
  meme_text: string;
  caption: string;
  hashtags: string[];
};

export async function copyToClipboard(
  idea: CopyableIdea,
  showToast?: ToastHandler
): Promise<boolean> {
  const content = `📝 Meme: ${idea.meme_text}
✍️ Caption: ${idea.caption}
🏷️ Hashtags: ${idea.hashtags.join(" ")}`;

  try {
    await navigator.clipboard.writeText(content);
    showToast?.("success", "Idea copied to clipboard.");
    return true;
  } catch {
    showToast?.("error", "Could not copy idea.");
    return false;
  }
}
