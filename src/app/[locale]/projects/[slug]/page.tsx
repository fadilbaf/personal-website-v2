import { ProjectService } from "@/src/services/project.service";
import { LinksService } from "@/src/services/links.service";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "./project-detail-client";
import { MainHeader } from "@/src/components/main/main-header";
import { MainFooter } from "@/src/components/main/main-footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import type { MainLocale } from "@/src/lib/main-translations";
import { toStorageUrl } from "@/src/lib/storage-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  try {
    const project = await ProjectService.getBySlug(slug);
    if (!project || !project.is_published) {
      return {};
    }

    const title = locale === "id" 
      ? `${project.title_id} | Proyek Fadil Bafagih` 
      : `${project.title_en} | Projects by Fadil Bafagih`;
    const description = locale === "id"
      ? project.bio_id || `Detail proyek ${project.title_id}`
      : project.bio_en || `Project details of ${project.title_en}`;

    const ogImage = toStorageUrl(project.project_images?.[0]?.image_url) || "/opengraph-image.png";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: ogImage }],
      },
    };
  } catch {
    return {};
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as MainLocale;

  let project;
  try {
    project = await ProjectService.getBySlug(slug);
  } catch {
    notFound();
  }

  if (!project || !project.is_published) {
    notFound();
  }

  const { about, contact } = await LinksService.getAll();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950 font-sans transition-colors duration-300">
      <MainHeader locale={locale} hireMeEmail={contact?.email ?? null} />

      <main className="w-full pt-14">
        <ProjectDetailClient
          project={project}
          contact={contact}
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
