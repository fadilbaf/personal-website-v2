"use client";

import { motion } from "framer-motion";
import { LinksHeader } from "@/src/components/links/links-header";
import { LinksProfile } from "@/src/components/links/links-profile";
import { LinksSection } from "@/src/components/links/links-section";
import { LinksContact } from "@/src/components/links/links-contact";
import { LinksFooter } from "@/src/components/links/links-footer";
import type { LinksLocale } from "@/src/lib/links-translations";
import type { LinksPageData } from "@/src/services/links.service";
import { ScrollToTop } from "@/components/scroll-to-top";

interface LinksClientProps {
  locale: LinksLocale;
  initialData: LinksPageData;
}

export function LinksClient({ locale, initialData }: LinksClientProps) {
  const data = initialData;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 md:bg-neutral-50 md:dark:bg-neutral-950 relative">
      {/* Desktop background pattern — matches login page */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-neutral-200/50 blur-3xl dark:bg-white/5" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-neutral-200/50 blur-3xl dark:bg-white/5" />
      </div>

      {/* Centered container */}
      <div className="relative min-h-screen flex flex-col md:items-center md:justify-start md:py-8">
        <div className="w-full max-w-md mx-auto md:border md:border-neutral-200/60 md:bg-white/80 md:shadow-xl md:shadow-black/5 md:backdrop-blur-xl md:dark:border-white/10 md:dark:bg-neutral-900/80 md:dark:shadow-white/5 md:rounded-2xl flex flex-col flex-1 md:flex-none">
          {/* Header */}
          <LinksHeader locale={locale} contact={data.contact ?? null} />

          {/* Content */}
          <div className="flex-1">
            <LinksProfile
              profile={data.profile ?? null}
              roles={data.roles ?? []}
              contact={data.contact ?? null}
              locale={locale}
            />

            <LinksSection
              contact={data.contact ?? null}
              locale={locale}
            />

            <LinksContact locale={locale} />

            <div className="border-t border-neutral-200/60 dark:border-white/10" />

            <LinksFooter locale={locale} />
          </div>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
