import { BlogService } from "@/src/services/blog.service";
import { LinksService } from "@/src/services/links.service";
import { notFound } from "next/navigation";
import { BlogDetailClient } from "./blog-detail-client";
import { MainHeader } from "@/src/components/main/main-header";
import { MainFooter } from "@/src/components/main/main-footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import type { MainLocale } from "@/src/lib/main-translations";

/**
 * Extracts a clean plain-text excerpt from blog content for SEO & social media previews.
 * Strips code blocks, tables, HTML tags, and truncates cleanly at word boundaries (~160 chars).
 */
function extractBlogExcerpt(content: string | null, maxLength = 160): string {
  if (!content) return "";
  const clean = content
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<table[\s\S]*?<\/table>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return "";
  if (clean.length <= maxLength) return clean;
  const truncated = clean.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  try {
    const blog = await BlogService.getBySlug(slug);
    if (!blog || !blog.is_published) {
      return {};
    }

    const title = locale === "id"
      ? `${blog.title_id} | Blog Fadil Bafagih`
      : `${blog.title_en} | Blog by Fadil Bafagih`;
    
    const rawContent = locale === "id" ? blog.content_id : blog.content_en;
    const excerpt = extractBlogExcerpt(rawContent);

    const fallbackDesc = locale === "id"
      ? `Baca artikel "${blog.title_id}" oleh Fadil Bafagih.`
      : `Read "${blog.title_en}" by Fadil Bafagih.`;

    const description = excerpt || fallbackDesc;
    const ogImage = blog.image_url || "/opengraph-image.png";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        images: [{ url: ogImage }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as MainLocale;

  let blog;
  try {
    blog = await BlogService.getBySlug(slug);
  } catch {
    notFound();
  }

  if (!blog || !blog.is_published) {
    notFound();
  }

  const { about, contact } = await LinksService.getAll();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950 font-sans transition-colors duration-300">
      <MainHeader locale={locale} hireMeEmail={contact?.email ?? null} />

      <main className="w-full pt-14">
        <BlogDetailClient
          blog={blog}
          locale={locale}
        />
      </main>

      <MainFooter
        about={about}
        contact={contact}
        locale={locale}
      />
      <ScrollToTop />
    </div>
  );
}
