/**
 * Strips HTML tags and Markdown formatting to produce clean, readable plain text.
 * Replaces block-level elements with spaces to prevent words from sticking together,
 * while preserving compound words inside inline tags.
 */
export function stripMarkdown(content: string | null): string {
  if (!content) return "";

  let cleaned = content
    // Remove code blocks and tables first
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<table[\s\S]*?<\/table>/gi, " ")
    // Replace HTML block tags and line breaks with space
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|section|article)>/gi, " ")
    .replace(/<(p|div|h[1-6]|li|tr|blockquote|section|article)[^>]*>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<hr\s*\/?>/gi, " ")
    // Remove inline HTML tags without extra spaces (preserves compound words like <strong>Re</strong>mote)
    .replace(/<[^>]*>/g, "")
    // Markdown formatting cleanup
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/(`{1,3})(.*?)\1/g, "$2")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/^#{1,6}\s+/gm, " ")
    .replace(/^>\s+/gm, " ");

  // Replace HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&middot;/gi, "•")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—");

  // Collapse multiple whitespaces and newlines into a single clean space
  return cleaned.replace(/\s+/g, " ").trim();
}

/**
 * Calculates estimated reading time in minutes based on clean text word count (200 WPM).
 * Guaranteed to produce identical reading times between cards and detail views.
 */
export function calculateReadingTime(content: string | null): number {
  if (!content) return 1;
  const clean = stripMarkdown(content);
  if (!clean) return 1;
  const words = clean.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Extracts a clean plain-text excerpt for SEO and social media previews.
 */
export function extractBlogExcerpt(content: string | null, maxLength = 160): string {
  if (!content) return "";
  const clean = stripMarkdown(content);
  if (!clean) return "";
  if (clean.length <= maxLength) return clean;
  const truncated = clean.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
}
