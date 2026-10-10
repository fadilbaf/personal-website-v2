import { AchievementService } from "@/src/services/achievement.service";
import { LinksService } from "@/src/services/links.service";
import { AchievementsClient } from "./achievements-client";
import { MainPublicShell } from "@/src/components/main/main-public-shell";
import type { MainLocale } from "@/src/lib/main-translations";
import { ScrollToTop } from "@/components/scroll-to-top";

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

  // Fetch all required data concurrently
  const [achievements, types, categories, { profile, roles, badges, about, contact }] = await Promise.all([
    AchievementService.getAll(),
    AchievementService.getTypes(),
    AchievementService.getCategories(),
    LinksService.getAll(),
  ]);

  // Filter only published achievements for the public page
  const publishedAchievements = achievements.filter((a) => a.is_published);

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
        <AchievementsClient
          achievements={publishedAchievements}
          types={types}
          categories={categories}
          locale={locale}
        />
      </main>

      <ScrollToTop />
    </MainPublicShell>
  );
}
