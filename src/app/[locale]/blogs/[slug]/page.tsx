import { BlogService } from "@/src/services/blog.service";
import { LinksService } from "@/src/services/links.service";
import { notFound } from "next/navigation";
import { BlogDetailClient } from "./blog-detail-client";
import { MainPublicShell } from "@/src/components/main/main-public-shell";
import { ScrollToTop } from "@/components/scroll-to-top";
import type { MainLocale } from "@/src/lib/main-translations";
import { extractBlogExcerpt } from "@/src/lib/blog-utils";
import { toStorageUrl } from "@/src/lib/storage-url";

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
    const ogImage = toStorageUrl(blog.image_url) || "/opengraph-image.png";

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

  const { profile, roles, badges, about, contact } = await LinksService.getAll();

  return (
    <MainPublicShell
      profile={profile}
      roles={roles}
      badges={badges}
      contact={contact}
      about={about}
      locale={locale}
    >
      <main className="w-full flex-1 flex flex-col overflow-visible">
        <BlogDetailClient
          blog={blog}
          locale={locale}
        />
      </main>

      <ScrollToTop />
    </MainPublicShell>
  );
}
