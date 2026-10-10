import { AchievementService } from "@/src/services/achievement.service";
import { AchievementsClient } from "./achievements-client";
import type { MainLocale } from "@/src/lib/main-translations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const title = locale === "id" ? "Pencapaian | Fadil Bafagih" : "Achievements | Fadil Bafagih";
  const description = locale === "id"
    ? "Kumpulan pencapaian, sertifikat, lisensi, penghargaan, dan apresiasi saya secara lengkap."
    : "Showcase of my achievements, certificates, licenses, awards, and appreciation.";

  return {
    title,
    description,
  };
}

export default async function AchievementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as MainLocale;

  // Fetch only achievement-related data concurrently
  const [achievements, types, categories] = await Promise.all([
    AchievementService.getAll(),
    AchievementService.getTypes(),
    AchievementService.getCategories(),
  ]);

  // Filter only published achievements for the public page
  const publishedAchievements = achievements.filter((a) => a.is_published);

  return (
    <main className="w-full flex-1 flex flex-col overflow-visible">
      <AchievementsClient
        achievements={publishedAchievements}
        types={types}
        categories={categories}
        locale={locale}
      />
    </main>
  );
}
