"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit2,
  Code2,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Project, ProjectType, ProjectCategory, Skill } from "@/src/types/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/app/lib/utils";
import { trackEvent } from "@/src/lib/track-event";
import { toStorageUrl } from "@/src/lib/storage-url";

interface ProjectsClientProps {
  projects: Project[];
  types: ProjectType[];
  categories: ProjectCategory[];
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

export function ProjectsClient({ projects, types, categories, locale }: ProjectsClientProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [cols, setCols] = useState(3);
  const [mounted, setMounted] = useState(false);

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
        setPageSize(15);
      } else {
        setCols(3);
        setPageSize(15);
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
        label: tMain(locale, "project_type"),
        options: types
          .filter(t => t.is_active)
          .map(t => ({
            label: locale === "id" ? t.name_id : t.name_en,
            value: t.id
          }))
      },
      {
        key: "category_id",
        label: tMain(locale, "project_category"),
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

  // Filtered projects list
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "") return;
      result = result.filter((p) => String((p as Record<string, any>)[key] ?? "") === String(val));
    });

    // Apply search filter
    if (!search.trim()) return result;
    const term = search.toLowerCase();
    return result.filter((item) => {
      const title = locale === "id" ? item.title_id : item.title_en;
      const bio = locale === "id" ? item.bio_id : item.bio_en;
      const skills = item.project_skills?.map((ps) => ps.skill?.name).filter((name): name is string => !!name) || [];

      return (
        title?.toLowerCase().includes(term) ||
        bio?.toLowerCase().includes(term) ||
        skills.some((s) => s.toLowerCase().includes(term))
      );
    });
  }, [projects, search, activeFilters, locale]);

  // Paginated data
  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const displayTotalPages = totalPages === 0 ? 1 : totalPages;
  const paginatedProjects = useMemo(() => {
    // Prevent rendering mismatch on SSR
    if (!mounted) return filteredProjects.slice(0, 15);
    return filteredProjects.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredProjects, page, pageSize, mounted]);

  // Pagination string interpolation helper
  const showingInfoText = useMemo(() => {
    const startVal = filteredProjects.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const endVal = Math.min(page * pageSize, filteredProjects.length);
    const totalVal = filteredProjects.length;

    return tMain(locale, "showing_info_projects")
      .replace("{start}", String(startVal))
      .replace("{end}", String(endVal))
      .replace("{total}", String(totalVal));
  }, [filteredProjects.length, page, pageSize, locale]);

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
                sessionStorage.setItem("scroll_to_projects", "true");
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
          <FolderGit2 className="h-[22px] w-[22px] text-neutral-900 dark:text-white" />
          <h1 className="text-[24px] leading-none font-medium tracking-tight text-neutral-900 dark:text-white">
            {tMain(locale, "projects_title")}
          </h1>
        </div>
        <p className="text-[15px] font-regular text-neutral-500 dark:text-neutral-400">
          {tMain(locale, "projects_desc")}
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
            placeholder={tMain(locale, "search_projects")}
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

      {/* 3. Grid Card Projects */}
      <div className={cn("relative w-full", paginatedProjects.length === 0 && "min-h-[300px]")}>
        <AnimatePresence mode="wait">
          {paginatedProjects.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center text-neutral-500 py-16"
            >
              <FolderGit2 className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium">{tMain(locale, "no_projects_found")}</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full"
            >
              {paginatedProjects.map((item, index) => {
                // Extract sorted images and first image url
                const images = [...(item.project_images || [])].sort((a, b) => a.sort_order - b.sort_order);
                const mainImageUrl = toStorageUrl(images[0]?.image_url);

                // Extract technologies
                const skills = (item.project_skills?.map((ps) => ps.skill).filter((s): s is Skill => !!s) || []);
                const displayedSkills = skills.slice(0, 3);
                const hasMoreSkills = skills.length > 3;
                const remainingSkillsCount = skills.length - 3;

                // Localization
                const title = locale === "id" ? item.title_id : item.title_en;
                const bio = locale === "id" ? item.bio_id : item.bio_en;

                return (
                  <motion.div
                    key={item.id}
                    custom={{ index, cols }}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="group relative flex flex-col rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 backdrop-blur-sm overflow-hidden transition-colors duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 active:border-neutral-300 dark:active:border-neutral-700 cursor-pointer"
                  >
                    {/* Full-Card Stretched Link */}
                    <Link
                      href={`/${locale}/projects/${item.slug}`}
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          sessionStorage.setItem("prev_project_page", "all");
                        }
                        trackEvent("project_click", item.slug);
                      }}
                      className="absolute inset-0 z-0"
                      aria-label={title}
                    />

                    {/* 1. Project Image Container */}
                    <div className="group/img relative aspect-video w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden text-left block pointer-events-none">
                      {mainImageUrl ? (
                        <img
                          src={mainImageUrl}
                          alt={title || "Project preview"}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600 gap-2">
                          <FolderGit2 className="h-10 w-10 stroke-[1.5]" />
                        </div>
                      )}

                      {/* Badges Overlay (Type & Category) */}
                      {(item.type || item.category) && (
                        <div className="absolute bottom-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
                          {item.type && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium tracking-tight bg-white/90 dark:bg-neutral-950/80 backdrop-blur-md text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-white/10 shadow-xs">
                              {locale === "id" ? item.type.name_id : item.type.name_en}
                            </span>
                          )}
                          {item.category && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium tracking-tight bg-white/90 dark:bg-neutral-950/80 backdrop-blur-md text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-white/10 shadow-xs">
                              {locale === "id" ? item.category.name_id : item.category.name_en}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-5 text-left pointer-events-none">
                      {/* Project Title */}
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight truncate group-hover:underline group-active:underline underline-offset-2 transition-all">
                        {title}
                      </h3>

                      {/* Project Bio/Description (max 2 lines) */}
                      <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed line-clamp-2 min-h-[40px]">
                        {bio}
                      </p>

                      {/* Tech Stack Pills (max 1 line) */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3.5 h-7 overflow-hidden">
                        {displayedSkills.map((skill) => (
                          <div
                            key={skill.id}
                            className="group/pill flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-200 bg-transparent dark:border-white/10 text-xs font-normal text-neutral-600 dark:text-neutral-400 transition-colors duration-200 hover:bg-neutral-50/50 hover:border-neutral-300 dark:hover:bg-white/3 dark:hover:border-white/20 hover:text-black dark:hover:text-white shrink-0"
                          >
                            {skill.icon_url ? (
                              <img
                                src={toStorageUrl(skill.icon_url)}
                                alt={skill.name}
                                className="w-3 h-3 object-contain brightness-0 dark:invert transition-transform duration-200 group-hover/pill:scale-110 shrink-0"
                              />
                            ) : (
                              <Code2 className="w-3 h-3 text-neutral-400 shrink-0" />
                            )}
                            <span>{skill.name}</span>
                          </div>
                        ))}
                        {hasMoreSkills && (
                          <span className="inline-flex items-center rounded-md border border-neutral-200 dark:border-white/10 px-2.5 py-1 text-xs font-normal text-neutral-500 dark:text-neutral-400 bg-transparent shrink-0">
                            +{remainingSkillsCount}
                          </span>
                        )}
                      </div>

                      {/* Spacer */}
                      <div className="flex-1 mt-5" />

                      {/* Card Bottom Actions */}
                      <div className="grid grid-cols-2 gap-3 w-full pointer-events-auto relative z-10">
                        {/* Left Button: Live Demo or Source Code */}
                        {item.live_url ? (
                          <a
                            href={item.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackEvent("project_click", `${item.slug}-live`);
                            }}
                            className="h-10 inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-900 cursor-pointer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>{tMain(locale, "live_demo")}</span>
                          </a>
                        ) : item.github_url ? (
                          <a
                            href={item.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackEvent("project_click", `${item.slug}-code`);
                            }}
                            className="h-10 inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-900 cursor-pointer"
                          >
                            <Code2 className="h-3.5 w-3.5" />
                            <span>{tMain(locale, "source_code")}</span>
                          </a>
                        ) : (
                          // Empty state placeholder to preserve grid layout height
                          <div className="h-10" />
                        )}

                        {/* Right Button: View Project */}
                        <Link
                          href={`/${locale}/projects/${item.slug}`}
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              sessionStorage.setItem("prev_project_page", "all");
                            }
                            trackEvent("project_click", item.slug);
                          }}
                          className="h-10 inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-900 text-white px-3 text-xs font-semibold transition-colors duration-200 group-hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:group-hover:bg-neutral-100 cursor-pointer"
                        >
                          <span>{tMain(locale, "view_project")}</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Animated Pagination Footer */}
      {filteredProjects.length > 0 && (
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
    </div>
  );
}
