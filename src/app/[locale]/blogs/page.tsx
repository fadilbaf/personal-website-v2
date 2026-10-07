import { BlogService } from "@/src/services/blog.service";
import { LinksService } from "@/src/services/links.service";
import { BlogsClient } from "./blogs-client";
import { MainPublicShell } from "@/src/components/main/main-public-shell";
import type { MainLocale } from "@/src/lib/main-translations";
import { ScrollToTop } from "@/components/scroll-to-top";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const title = locale === "id" ? "Blog | Fadil Bafagih" : "Blogs | Fadil Bafagih";
  const description = locale === "id"
    ? "Tulisan, artikel, pemikiran, dan pembelajaran saya seputar dunia pemrograman dan teknologi."
    : "My writings, articles, thoughts, and learnings about programming and technology.";

  return {
    title,
    description,
  };
}

export default async function BlogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as MainLocale;

  // Fetch all required data concurrently
  const [blogs, types, categories, { profile, roles, badges, about, contact }] = await Promise.all([
    BlogService.getAll(),
    BlogService.getTypes(),
    BlogService.getCategories(),
    LinksService.getAll(),
  ]);

  // Filter only published blogs for the public page
  const publishedBlogs = blogs.filter((b) => b.is_published);

  return (
    <MainPublicShell
      profile={profile}
      roles={roles}
      badges={badges}
      contact={contact}
      about={about}
      locale={locale}
    >
      <main className="w-full flex-1 flex flex-col overflow-x-hidden">
        <BlogsClient
          blogs={publishedBlogs}
          types={types}
          categories={categories}
          locale={locale}
        />
      </main>

      <ScrollToTop />
    </MainPublicShell>
  );
}
