"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye
} from "lucide-react";
import Link from "next/link";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Blog, BlogType, BlogCategory } from "@/src/types/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/app/lib/utils";
import { trackEvent } from "@/src/lib/track-event";

interface BlogsClientProps {
  blogs: Blog[];
  types: BlogType[];
  categories: BlogCategory[];
  locale: MainLocale;
}

const cardVariants = {
  hidden: { opacity: 0, filter: "blur(6px)", y: 6 },
  visible: (custom: { index: number }) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
      delay: (custom.index % 5) * 0.1,
    },
  }),
};

const formatDate = (dateStr: string | null, locale: MainLocale): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

import { stripMarkdown, calculateReadingTime } from "@/src/lib/blog-utils";

export function BlogsClient({ blogs, types, categories, locale }: BlogsClientProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  // Responsive page size calculations
  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setPageSize(5);
      } else {
        setPageSize(10);
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
        label: tMain(locale, "blog_type"),
        options: types
          .filter((t) => t.is_active)
          .map((t) => ({
            label: locale === "id" ? t.name_id : t.name_en,
            value: t.id,
          })),
      },
      {
        key: "category_id",
        label: tMain(locale, "blog_category"),
        options: categories
          .filter((c) => c.is_active)
          .map((c) => ({
            label: locale === "id" ? c.name_id : c.name_en,
            value: c.id,
          })),
      },
    ];

    return filterConfig.map((filter) => ({
      ...filter,
      options: [{ label: tMain(locale, "all"), value: undefined }, ...filter.options],
    }));
  }, [types, categories, locale]);

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter(
      (val) => val !== undefined && val !== null && val !== ""
    ).length;
  }, [activeFilters]);

  // Filtered blogs list
  const filteredBlogs = useMemo(() => {
    let result = blogs;

    // Apply active filters
    Object.entries(activeFilters).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "") return;
      result = result.filter((b) => String((b as Record<string, any>)[key] ?? "") === String(val));
    });

    // Apply search filter
    if (!search.trim()) return result;
    const term = search.toLowerCase();
    return result.filter((item) => {
      const title = locale === "id" ? item.title_id : item.title_en;
      const content = locale === "id" ? item.content_id : item.content_en;

      return (
        title?.toLowerCase().includes(term) ||
        content?.toLowerCase().includes(term)
      );
    });
  }, [blogs, search, activeFilters, locale]);

  // Paginated data
  const totalPages = Math.ceil(filteredBlogs.length / pageSize);
  const displayTotalPages = totalPages === 0 ? 1 : totalPages;
  const paginatedBlogs = useMemo(() => {
    if (!mounted) return filteredBlogs.slice(0, 10);
    return filteredBlogs.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredBlogs, page, pageSize, mounted]);

  // Pagination info
  const showingInfoText = useMemo(() => {
    const startVal = filteredBlogs.length === 0 ? 0 : (page - 1) * pageSize + 1;
    const endVal = Math.min(page * pageSize, filteredBlogs.length);
    const totalVal = filteredBlogs.length;

    return tMain(locale, "showing_info_blogs")
      .replace("{start}", String(startVal))
      .replace("{end}", String(endVal))
      .replace("{total}", String(totalVal));
  }, [filteredBlogs.length, page, pageSize, locale]);

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
                sessionStorage.setItem("scroll_to_blogs", "true");
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
          <BookOpen className="h-[22px] w-[22px] text-neutral-900 dark:text-white" />
          <h1 className="text-[24px] leading-none font-medium tracking-tight text-neutral-900 dark:text-white">
            {tMain(locale, "blogs_title")}
          </h1>
        </div>
        <p className="text-[15px] font-regular text-neutral-500 dark:text-neutral-400">
          {tMain(locale, "blogs_desc")}
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
            placeholder={tMain(locale, "search_blogs")}
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

      {/* 3. Vertical List Card Blogs */}
      <div className={cn("relative w-full", paginatedBlogs.length === 0 && "min-h-[300px]")}>
        <AnimatePresence mode="wait">
          {paginatedBlogs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center py-16 text-center"
            >
              <BookOpen className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {tMain(locale, "no_blogs_found")}
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
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6 w-full"
            >
              {paginatedBlogs.map((blog, index) => {
                const content = locale === "id" ? blog.content_id : blog.content_en;
                const title = locale === "id" ? blog.title_id : blog.title_en;
                const excerpt = stripMarkdown(content);
                const readingTime = calculateReadingTime(content);
                const formattedDate = formatDate(blog.created_at, locale);

                return (
                  <motion.div
                    key={blog.id}
                    custom={{ index }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={cardVariants}
                    className="group relative"
                  >
                    <Link
                      href={`/${locale}/blogs/${blog.slug}`}
                      onClick={() => {
                        sessionStorage.setItem("prev_blog_page", "all");
                        trackEvent("blog_click", title);
                      }}
                      className="flex flex-col rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 backdrop-blur-sm p-5 text-left transition-colors duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 active:border-neutral-300 dark:active:border-neutral-700 cursor-pointer focus:outline-none"
                    >
                      {/* 1. Type & Category Badges Row (Top) */}
                      {(blog.type || blog.category) && (
                        <div className="flex items-center gap-1.5 flex-wrap mb-3">
                          {blog.type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-tight bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-white/10 shrink-0">
                              {locale === "id" ? blog.type.name_id : blog.type.name_en}
                            </span>
                          )}
                          {blog.category && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-tight bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-white/10 shrink-0">
                              {locale === "id" ? blog.category.name_id : blog.category.name_en}
                            </span>
                          )}
                        </div>
                      )}

                      {/* 2. Meta Row (Author Profile, Name, Date, Reading Time) */}
                      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                        {blog.author?.photo_url ? (
                          <img
                            src={blog.author.photo_url}
                            alt={blog.author.full_name || "Author"}
                            className="h-6 w-6 rounded-full object-cover border border-neutral-100 dark:border-neutral-800 shrink-0"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 shrink-0">
                            {(blog.author?.full_name || "A").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-normal text-left">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                            {blog.author?.full_name || "Author"}
                          </span>
                          <span className="text-[10px] mx-1.5 text-neutral-400 dark:text-neutral-500 select-none relative -top-px">•</span>
                          <span>{formattedDate}</span>
                          <span className="text-[10px] mx-1.5 text-neutral-400 dark:text-neutral-500 select-none relative -top-px">•</span>
                          <span>
                            {readingTime} {tMain(locale, "min_read")}
                          </span>
                        </p>
                      </div>

                      {/* 3. Title Row */}
                      <h3 className="text-base sm:text-[18px] font-semibold text-neutral-900 dark:text-white line-clamp-1 leading-snug mt-3 group-hover:underline group-active:underline underline-offset-2 transition-all">
                        {title}
                      </h3>

                      {/* Excerpt Row */}
                      <p className="text-[13px] font-normal text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed whitespace-pre-line mt-2">
                        {excerpt}
                      </p>

                      {/* Action Row */}
                      <div className="flex items-center justify-between gap-4 mt-5">
                        <div className="inline-flex items-center gap-3.5 rounded-lg border border-neutral-200 dark:border-white/10 px-3 py-2 bg-white dark:bg-neutral-900/50 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300" />
                            <span>{blog.views_count ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Heart className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300" />
                            <span>{blog.likes_count ?? 0}</span>
                          </div>
                        </div>

                        <span className="h-10 inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 group-hover:bg-neutral-800 text-white dark:bg-white dark:group-hover:bg-neutral-100 dark:text-neutral-900 px-4 text-xs font-semibold transition-colors duration-200 shrink-0">
                          <span>{tMain(locale, "read_more")}</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Animated Pagination Footer */}
      {filteredBlogs.length > 0 && (
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
