import { BlogService } from "@/src/services/blog.service";
import { BlogsClient } from "./blogs-client";
import type { MainLocale } from "@/src/lib/main-translations";

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

  // Fetch only blog-related data concurrently
  const [blogs, types, categories] = await Promise.all([
    BlogService.getAll(),
    BlogService.getTypes(),
    BlogService.getCategories(),
  ]);

  // Filter only published blogs for the public page
  const publishedBlogs = blogs.filter((b) => b.is_published);

  return (
    <main className="w-full flex-1 flex flex-col overflow-visible">
      <BlogsClient
        blogs={publishedBlogs}
        types={types}
        categories={categories}
        locale={locale}
      />
    </main>
  );
}
