"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Download } from "lucide-react";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Profile, Contact, About, Role, Badge as HeroBadge } from "@/src/types/database";
import { trackEvent } from "@/src/lib/track-event";
import { toStorageUrl } from "@/src/lib/storage-url";
import { PdfViewerModal, extractPdfFileName } from "@/components/dashboard/pdf-viewer-modal";

interface MainHeroProps {
  profile: Profile | null;
  roles?: Role[];
  badges?: HeroBadge[];
  about: About | null;
  contact?: Contact | null;
  locale: MainLocale;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 0.5, 
      ease: "easeOut" as const,
    },
  },
};

export function MainHero({ profile, badges = [], about, contact, locale }: MainHeroProps) {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [isCvPdfOpen, setIsCvPdfOpen] = useState(false);

  const activeBadges = badges.filter((b) => b.is_active);

  // Cycle through badges every 3.5 seconds
  useEffect(() => {
    if (activeBadges.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBadgeIndex((prev) => (prev + 1) % activeBadges.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeBadges.length]);

  const currentBadgeText = activeBadges.length > 0
    ? locale === "id"
      ? activeBadges[currentBadgeIndex]?.name_id
      : activeBadges[currentBadgeIndex]?.name_en
    : tMain(locale, "available");

  const locationPrefix = locale === "id" ? "Berdomisili di" : "Based in";
  const rawLocation = contact?.location?.trim();
  const locationText = rawLocation
    ? rawLocation.toLowerCase().startsWith("based in") ||
      rawLocation.toLowerCase().startsWith("berdomisili di")
      ? rawLocation
      : `${locationPrefix} ${rawLocation}`
    : null;

  const descText = locale === "id" ? about?.description_id : about?.description_en;

  return (
    <div className="relative w-full pt-8 pb-4 md:pt-10 md:pb-6 flex flex-col">
      <motion.section
        id="about"
        className="scroll-mt-20 flex flex-col justify-start items-start text-left z-10 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col items-start gap-4 md:gap-4.5 w-full">
          
          {/* Greeting & Name */}
          <div className="flex flex-col gap-1 w-full">
            <motion.p variants={fadeUpVariants} className="text-neutral-500 dark:text-neutral-400 font-normal text-sm sm:text-base">
              {tMain(locale, "hello")}
            </motion.p>
            <motion.h1 variants={fadeUpVariants} className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
              {profile?.full_name || "Fadil Bafagih"}
            </motion.h1>
          </div>

          {/* Location & Dynamic Badge (Dot + Text) */}
          <motion.div
            variants={fadeUpVariants}
            className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal"
          >
            {locationText && (
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-800 dark:bg-neutral-200 shrink-0" />
                <span>{locationText}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <div className="h-5 flex items-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentBadgeIndex}
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    animate={{ clipPath: "inset(0 0% 0 0)" }}
                    exit={{ clipPath: "inset(0 100% 0 0)" }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="inline-block whitespace-nowrap"
                  >
                    {currentBadgeText}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Description text */}
          {descText && (
            <motion.div
              variants={fadeUpVariants}
              className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-[15px] leading-relaxed max-w-none pt-1"
              dangerouslySetInnerHTML={{ __html: descText.replace(/\n/g, '<br />') }}
            />
          )}

          {/* CTAs: Let's Work Together & Download CV */}
          <motion.div
            variants={fadeUpVariants}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <a
              href={contact?.email ? `mailto:${contact.email}` : "mailto:fadilbafagih@gmail.com"}
              onClick={() => trackEvent("contact_click", "hero_cta")}
              className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 font-medium transition-colors text-sm cursor-pointer shadow-xs"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span>{tMain(locale, "lets_work")}</span>
            </a>

            {about?.cv_url && (
              <button
                type="button"
                onClick={() => setIsCvPdfOpen(true)}
                className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 font-medium hover:bg-neutral-50 active:bg-neutral-50 transition-colors dark:border-white/10 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:active:bg-neutral-800 text-sm cursor-pointer shadow-xs"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>{tMain(locale, "download_cv")}</span>
              </button>
            )}
          </motion.div>

        </div>
      </motion.section>

      {/* CV PDF Viewer Modal */}
      {about?.cv_url && (
        <PdfViewerModal
          isOpen={isCvPdfOpen}
          onClose={() => setIsCvPdfOpen(false)}
          pdfUrl={toStorageUrl(about.cv_url)}
          fileName={extractPdfFileName(about.cv_url) || "CV / Resume"}
        />
      )}
    </div>
  );
}
