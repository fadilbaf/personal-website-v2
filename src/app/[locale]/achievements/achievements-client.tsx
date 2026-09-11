"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import Link from "next/link";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Achievement, AchievementType, AchievementCategory } from "@/src/types/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/app/lib/utils";
import { trackEvent } from "@/src/lib/track-event";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

interface AchievementsClientProps {
  achievements: Achievement[];
  types: AchievementType[];
  categories: AchievementCategory[];
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
      delay: (custom.index % custom.cols) * 0.1,
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

export function AchievementsClient({ achievements, types, categories, locale }: AchievementsClientProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [cols, setCols] = useState(4);
  const [mounted, setMounted] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Filter States
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [pendingFilters, setPendingFilters] = useState<Record<string, any>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync pending filters when opening dropdown
  useEffect(() => {
    if (isFilterOpen) {
      setPendingFilters(activeFilters);
    }
  }, [isFilterOpen, activeFilters]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Responsive columns and page size calculations
  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCols(1);
        setPageSize(5);
      } else if (width < 1024) {
        setCols(2);
        setPageSize(20);
      } else {
        setCols(4);
        setPageSize(20);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter config
  const computedFilters = useMemo(() => {
    const filterConfig = [
      {
        key: "type_id",
        label: tMain(locale, "achievement_type"),
        options: types
          .filter(t => t.is_active)
          .map(t => ({
            label: locale === "id" ? t.name_id : t.name_en,
            value: t.id
          }))
      },
      {
        key: "category_id",
        label: tMain(locale, "achievement_category"),
        options: categories
          .filter(c => c.is_active)
          .map(c => ({
            label: locale === "id" ? c.name_id : c.name_en,
            value: c.id
          }))
      }
    ];

    return filterConfig.map(filter => ({
      ...filter,
      options: [{ label: tMain(locale, "all"), value: undefined }, ...filter.options]
    }));
  }, [types, categories, locale]);

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter(
      (val) => val !== undefined && val !== null && val !== ""
    ).length;
  }, [activeFilters]);

  // Filtered achievements list
  const filteredAchievements = useMemo(() => {
    let result = achievements;

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "") return;
      result = result.filter((a) => String((a as Record<string, any>)[key] ?? "") === String(val));
    });

    // Apply search filter
    if (!search.trim()) return result;
    const term = search.toLowerCase();
    return result.filter((item) => {
      const title = locale === "id" ? item.title_id : item.title_en;
      const publisher = item.publisher || "";
      const credentialId = item.credential_id || "";

      return (
        title?.toLowerCase().includes(term) ||
        publisher.toLowerCase().includes(term) ||
        credentialId.toLowerCase().includes(term)
      );
    });
  }, [achievements, search, activeFilters, locale]);

  // Paginated data
  const totalPages = Math.ceil(filteredAchievements.length / pageSize);
  const displayTotalPages = totalPages === 0 ? 1 : totalPages;
  const paginatedAchievements = useMemo(() => {
    // Prevent rendering mismatch on SSR
    if (!mounted) return filteredAchievements.slice(0, 20);
    return filteredAchievements.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredAchievements, page, pageSize, mounted]);

  // Pagination string interpolation helper
  const showingInfoText = useMemo(() => {
    const startVal = filteredAchievements.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const endVal = Math.min(page * pageSize, filteredAchievements.length);
    const totalVal = filteredAchievements.length;

    return tMain(locale, "showing_info_achievements")
      .replace("{start}", String(startVal))
      .replace("{end}", String(endVal))
      .replace("{total}", String(totalVal));
  }, [filteredAchievements.length, page, pageSize, locale]);

  return (
    <div className="w-full px-3.5 sm:px-12 md:px-24 lg:px-36 pt-6 md:pt-8 pb-3 md:pb-4 bg-transparent">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(6px)", y: -10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href={`/${locale}`}
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.setItem("scroll_to_achievements", "true");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{tMain(locale, "back")}</span>
          </Link>
        </motion.div>

        {/* 1. Header (Icon, Title, Description) */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(6px)", y: 15 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-1.5 text-left"
        >
        <div className="flex items-center gap-2.5">
          <Award className="h-[22px] w-[22px] text-neutral-900 dark:text-white" />
          <h1 className="text-[24px] leading-none font-medium tracking-tight text-neutral-900 dark:text-white">
            {tMain(locale, "achievements_title")}
          </h1>
        </div>
        <p className="text-[15px] font-regular text-neutral-500 dark:text-neutral-400">
          {tMain(locale, "achievements_desc")}
        </p>
      </motion.div>

      {/* 2. Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(6px)", y: 15 }}
        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
        className="flex items-center justify-between gap-4 relative z-30"
      >
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder={tMain(locale, "search_achievements")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-sm bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
          />
        </div>

        {/* Filters Trigger and Dropdown */}
        <div className="relative z-30" ref={dropdownRef}>
          <Button
            variant={activeFilterCount > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "h-9 px-3 gap-2 text-xs font-medium transition-all duration-200 cursor-pointer border",
              activeFilterCount > 0
                ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-200"
                : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-950 dark:hover:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{tMain(locale, "filter")}</span>
            {activeFilterCount > 0 && (
              <span className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold transition-colors",
                activeFilterCount > 0
                  ? "bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white"
                  : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              )}>
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Filter Dropdown panel */}
          {isFilterOpen && computedFilters.length > 0 && (
            <div className="absolute right-0 top-full mt-2 z-50 min-w-[240px] w-max max-w-[calc(100vw-2rem)] sm:max-w-[340px] rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-neutral-950 transition-all duration-200">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-white/10">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {tMain(locale, "filters")}
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setActiveFilters({});
                        setPendingFilters({});
                        setIsFilterOpen(false);
                        setPage(1);
                      }}
                      className="text-[10px] flex items-center gap-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {tMain(locale, "clear_all")}
                    </button>
                  )}
                </div>

                {/* Filter Content */}
                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {computedFilters.map((filter) => {
                    const currentValue = pendingFilters[filter.key];

                    return (
                      <div key={filter.key} className="space-y-2">
                        <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                          {filter.label}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {filter.options.map((opt) => {
                            const isSelected =
                              currentValue === opt.value ||
                              (currentValue === undefined && opt.value === undefined);

                            return (
                              <button
                                key={String(opt.label) + String(opt.value)}
                                type="button"
                                onClick={() => {
                                  setPendingFilters((prev) => ({
                                    ...prev,
                                    [filter.key]: opt.value,
                                  }));
                                }}
                                className={cn(
                                  "px-2.5 py-1 text-xs rounded-full border transition-all duration-150 cursor-pointer",
                                  isSelected
                                    ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-medium"
                                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-900/50 dark:hover:bg-neutral-900 dark:text-neutral-400 dark:border-white/10"
                                )}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer (Apply/Reset) */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-white/10 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveFilters({});
                      setPendingFilters({});
                      setIsFilterOpen(false);
                      setPage(1);
                    }}
                    className="flex-1 h-8 text-xs bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700 dark:bg-transparent dark:hover:bg-white/5 dark:border-white/10 dark:text-neutral-300 cursor-pointer"
                  >
                    {tMain(locale, "reset")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setActiveFilters(pendingFilters);
                      setIsFilterOpen(false);
                      setPage(1);
                    }}
                    className="flex-1 h-8 text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
                  >
                    {tMain(locale, "apply")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 3. Grid Card Achievements */}
      <div className={cn("relative w-full", paginatedAchievements.length === 0 && "min-h-[300px]")}>
        <AnimatePresence mode="wait">
          {paginatedAchievements.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center py-16 text-center"
            >
              <Award className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {tMain(locale, "no_achievements_found")}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setActiveFilters({});
                    setPendingFilters({});
                    setSearch("");
                    setPage(1);
                  }}
                  className="mt-2 text-xs font-semibold text-neutral-900 hover:underline dark:text-white cursor-pointer"
                >
                  {tMain(locale, "reset")}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
            >
              {paginatedAchievements.map((item, index) => {
                const title = locale === "id" ? item.title_id : item.title_en;

                return (
                  <motion.div
                    key={item.id}
                    custom={{ index, cols }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={cardVariants}
                    onClick={() => {
                      setSelectedAchievement(item);
                      trackEvent("achievement_click", title);
                    }}
                    className="flex group relative flex-col rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 backdrop-blur-sm overflow-hidden transition-colors duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 active:border-neutral-300 dark:active:border-neutral-700 cursor-pointer"
                  >
                    {/* Thumbnail Container */}
                    <div className="relative aspect-video w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden text-left block">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={title}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600 gap-2">
                          <Award className="h-10 w-10 stroke-[1.5]" />
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="flex flex-col p-5 flex-1 text-left">
                      {/* Credential ID */}
                      <span className="text-[11px] font-regular text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1 block truncate">
                        {item.credential_id || "\u00a0"}
                      </span>

                      {/* Title */}
                      <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-white line-clamp-2 leading-snug mb-1 group-hover:underline group-active:underline underline-offset-2 transition-all">
                        {title}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Animated Pagination Footer */}
      {filteredAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, filter: "blur(6px)", y: 15 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between gap-4 py-2 w-full"
        >
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 truncate">
            {showingInfoText}
          </p>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === 1}
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-30 cursor-pointer shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 select-none">
              <div className="flex h-8 min-w-8 px-2.5 items-center justify-center rounded-md border border-neutral-900 bg-neutral-900 text-white shadow-sm dark:border-white dark:bg-white dark:text-neutral-900 transition-colors duration-200">
                {page}
              </div>
              <span className="text-neutral-500 dark:text-neutral-500 font-medium whitespace-nowrap">
                {tMain(locale, "of")} {displayTotalPages}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setPage((p) => Math.min(displayTotalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === displayTotalPages}
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-30 cursor-pointer shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
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

                {/* Metadata Details Stacked List */}
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

                {/* Dynamic Credential URL Button */}
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
    </div>
  );
}
