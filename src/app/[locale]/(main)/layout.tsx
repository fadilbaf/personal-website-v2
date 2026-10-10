import type { ReactNode } from "react";
import { LinksService } from "@/src/services/links.service";
import { MainPublicShell } from "@/src/components/main/main-public-shell";
import type { MainLocale } from "@/src/lib/main-translations";
import { ScrollToTop } from "@/components/scroll-to-top";

export default async function MainPublicLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as MainLocale;

  // Single source of truth for public shell navigation and sidebar data
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
      {children}
      <ScrollToTop />
    </MainPublicShell>
  );
}
