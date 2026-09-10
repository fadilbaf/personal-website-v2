"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Award, ExternalLink, X } from "lucide-react";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Achievement } from "@/src/types/database";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

interface MainAchievementsProps {
  achievements: Achievement[];
  locale: MainLocale;
}

const cardVariants = {
  hidden: { opacity: 0, filter: "blur(6px)", y: 6 },
  visible: (custom: { index: number; cols: number }) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
      delay: (custom.index % custom.cols) * 0.15,
    },
  }),
};

const formatIssueDate = (dateStr: string | null, locale: MainLocale): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export function MainAchievements({ achievements, locale }: MainAchievementsProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setCols(1);
      else if (width < 1024) setCols(2);
      else setCols(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const scrollFlag = sessionStorage.getItem("scroll_to_achievements") === "true" || sessionStorage.getItem("scroll-target") === "achievements";
      if (scrollFlag) {
        setTimeout(() => {
          const element = document.getElementById("achievements");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  }, []);

  // Filter published achievements
  const publishedAchievements = achievements.filter((a) => a.is_published);

  // Render max 8 on desktop/tablet, max 3 on mobile (handled responsively by CSS classes)
  const displayedAchievements = publishedAchievements.slice(0, 8);

  return (
    <section id="achievements" className="scroll-mt-20 w-full px-3.5 sm:px-12 md:px-24 lg:px-36 pt-4 pb-6 md:pt-6 md:pb-8 bg-transparent">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Section Header */}
        <div className="flex flex-row items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-1.5 text-left w-full"
          >
            <div className="flex items-center gap-2.5">
              <Award className="h-[22px] w-[22px] text-neutral-900 dark:text-white" />
              <h2 className="text-[24px] leading-none font-medium tracking-tight text-neutral-900 dark:text-white">
                {tMain(locale, "achievements_title")}
              </h2>
            </div>
            <p className="text-[15px] font-regular text-neutral-500 dark:text-neutral-400">
              {tMain(locale, "achievements_desc")}
            </p>
            {/* Mobile View All Button */}
            <div className="flex md:hidden mt-2">
              <Link
                href={`/${locale}/achievements`}
                className="group/btn inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-4 py-2.5 text-xs font-semibold transition-colors duration-200 hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-100 cursor-pointer"
              >
                <span>{tMain(locale, "view_all_achievements")}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
            className="hidden md:block shrink-0"
          >
            <Link
              href={`/${locale}/achievements`}
              className="group/btn inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-4 py-2.5 text-xs font-semibold transition-colors duration-200 hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-100 cursor-pointer"
            >
              <span>{tMain(locale, "view_all_achievements")}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedAchievements.map((item, index) => {
            // Determine dynamic visibility: hide from index >= 3 on mobile
            const visibilityClass = index >= 3 ? "hidden sm:flex" : "flex";

            return (
              <motion.div
                key={item.id}
                custom={{ index, cols }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={cardVariants}
                onClick={() => setSelectedAchievement(item)}
                className={`${visibilityClass} group relative flex flex-col rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 backdrop-blur-sm overflow-hidden transition-colors duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 active:border-neutral-300 dark:active:border-neutral-700 cursor-pointer`}
              >
                {/* 1. Thumbnail Container */}
                <div className="relative aspect-video w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden text-left block">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={locale === "id" ? item.title_id : item.title_en}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600 gap-2">
                      <Award className="h-10 w-10 stroke-[1.5]" />
                    </div>
                  )}
                </div>

                {/* 2. Content Details */}
                <div className="flex flex-col p-5 flex-1">
                  {/* Credential ID */}
                  <span className="text-[11px] font-regular text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1 block truncate">
                    {item.credential_id || "\u00a0"}
                  </span>

                  {/* Title */}
                  <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-white line-clamp-2 leading-snug mb-1 group-hover:underline group-active:underline underline-offset-2 transition-all">
                    {locale === "id" ? item.title_id : item.title_en}
                  </h3>

                  {/* Issuer */}
                  {item.publisher && (
                    <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400 mb-1.5 block truncate">
                      {item.publisher}
                    </span>
                  )}

                  {/* Date */}
                  {item.issue_date && (
                    <span className="text-[11px] font-normal text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4 block">
                      {tMain(locale, "issued_on")} {formatIssueDate(item.issue_date, locale).toUpperCase()}
                    </span>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Button Action */}
                  <span className="w-full h-10 inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-900 text-white px-3 text-xs font-semibold transition-colors duration-200 group-hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:group-hover:bg-neutral-100 shrink-0">
                    <span>{tMain(locale, "view_achievement")}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Achievement Detail Modal using shadcn Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
        <DialogContent showCloseButton={false} className="w-full max-w-[calc(100%-2rem)] sm:max-w-[400px] bg-white dark:bg-neutral-900 border-none ring-0 shadow-2xl p-0 overflow-hidden rounded-2xl gap-0">
          {selectedAchievement && (
            <>
              {/* Image Container with custom Close Button Overlay */}
              <div className="relative aspect-video w-full bg-neutral-100 dark:bg-neutral-950">
                {selectedAchievement.image_url ? (
                  <img
                    src={selectedAchievement.image_url}
                    alt={locale === "id" ? selectedAchievement.title_id : selectedAchievement.title_en}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-400 dark:text-neutral-600">
                    <Award className="h-16 w-16 stroke-[1.2]" />
                  </div>
                )}
                
                {/* Close Button overlaying top-right corner */}
                <DialogClose asChild>
                  <button
                    type="button"
                    className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer z-10 focus:outline-none text-neutral-900 dark:text-neutral-100"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </button>
                </DialogClose>
              </div>

              {/* Text details content wrapper */}
              <div className="px-6 pt-5 pb-6 flex flex-col gap-5">
                {/* Title and Issuer */}
                <div className="text-left">
                  <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white leading-tight">
                    {locale === "id" ? selectedAchievement.title_id : selectedAchievement.title_en}
                  </DialogTitle>
                  
                  {selectedAchievement.publisher && (
                    <p className="text-sm font-normal text-neutral-500 dark:text-neutral-400 mt-1">
                      {selectedAchievement.publisher}
                    </p>
                  )}
                </div>

                {/* Metadata Details Stacked List (Icon-free) */}
                <div className="flex flex-col gap-4 text-left">
                  {/* Credential ID */}
                  <div>
                    <h4 className="text-[10px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                      {tMain(locale, "credential_id")}
                    </h4>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mt-0.5 break-all select-all">
                      {selectedAchievement.credential_id || "-"}
                    </p>
                  </div>

                  {/* Type */}
                  {selectedAchievement.type && (
                    <div>
                      <h4 className="text-[10px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                        {tMain(locale, "achievement_type")}
                      </h4>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {locale === "id" ? selectedAchievement.type.name_id : selectedAchievement.type.name_en}
                      </p>
                    </div>
                  )}

                  {/* Category */}
                  {selectedAchievement.category && (
                    <div>
                      <h4 className="text-[10px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                        {tMain(locale, "achievement_category")}
                      </h4>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {locale === "id" ? selectedAchievement.category.name_id : selectedAchievement.category.name_en}
                      </p>
                    </div>
                  )}

                  {/* Issue Date */}
                  {selectedAchievement.issue_date && (
                    <div>
                      <h4 className="text-[10px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                        {tMain(locale, "achievement_issue_date")}
                      </h4>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {formatIssueDate(selectedAchievement.issue_date, locale)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Dynamic Credential URL Button (Bottom Left Aligned) */}
                {selectedAchievement.credential_url && (
                  <div className="flex justify-start mt-1 text-left">
                    <a
                      href={selectedAchievement.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-2.5 text-xs font-semibold transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 cursor-pointer"
                    >
                      <span>{tMain(locale, "credential_url")}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
