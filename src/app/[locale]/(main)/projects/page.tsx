import { ProjectService } from "@/src/services/project.service";
import { ProjectsClient } from "./projects-client";
import type { MainLocale } from "@/src/lib/main-translations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const title = locale === "id" ? "Proyek | Fadil Bafagih" : "Projects | Fadil Bafagih";
  const description = locale === "id"
    ? "Kumpulan karya terbaru dan proyek sampingan saya secara lengkap."
    : "Showcase of my work and side projects.";

  return {
    title,
    description,
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as MainLocale;

  // Fetch only project-related data concurrently
  const [projects, types, categories] = await Promise.all([
    ProjectService.getAll(),
    ProjectService.getTypes(),
    ProjectService.getCategories(),
  ]);

  // Filter only published projects for the public page
  const publishedProjects = projects.filter((p) => p.is_published);

  return (
    <main className="w-full flex-1 flex flex-col overflow-visible">
      <ProjectsClient
        projects={publishedProjects}
        types={types}
        categories={categories}
        locale={locale}
      />
    </main>
  );
}
