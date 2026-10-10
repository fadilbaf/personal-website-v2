"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo, cloneElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { ChevronLeft, ChevronRight, Code2, Eye } from "lucide-react";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Profile, Role, Contact, About, Statistics, Skill, SkillCategory } from "@/src/types/database";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GitHubCalendar } from "react-github-calendar";
import { PdfViewerModal } from "@/components/dashboard/pdf-viewer-modal";
import { toStorageUrl } from "@/src/lib/storage-url";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

let cachedCanvas: HTMLCanvasElement | null = null;
let cachedCtx: CanvasRenderingContext2D | null = null;

function getPillWidth(name: string): number {
  if (typeof window === "undefined") return 48 + name.length * 8;
  if (!cachedCanvas) {
    cachedCanvas = document.createElement("canvas");
    cachedCtx = cachedCanvas.getContext("2d");
  }
  if (!cachedCtx) return 48 + name.length * 8;
  cachedCtx.font = "400 14px Inter, system-ui, -apple-system, sans-serif";
  // Exact DOM: border (2) + px-3 (24) + icon w-3.5 (14) + gap-2 (8) = 48px
  return 48 + Math.ceil(cachedCtx.measureText(name).width);
}

function getViewAllPillWidth(count: number, text: string): number {
  if (typeof window === "undefined") return 90;
  if (!cachedCanvas) {
    cachedCanvas = document.createElement("canvas");
    cachedCtx = cachedCanvas.getContext("2d");
  }
  if (!cachedCtx) return 90;
  cachedCtx.font = "400 14px Inter, system-ui, -apple-system, sans-serif";
  // Exact DOM: border (2) + px-2.5 (20) + icon w-3.5 (14) + gap-1 (4) = 40px
  return 40 + Math.ceil(cachedCtx.measureText(`+${count} ${text}`).width);
}


function calculate3RowFit(
  skillsList: Array<{ name: string }>,
  containerWidth: number,
  viewAllText: string
): number {
  if (skillsList.length === 0 || containerWidth <= 0) return skillsList.length;

  const gap = 8;
  const pillWidths = skillsList.map((s) => getPillWidth(s.name));

  // Check if ALL skills fit within 3 rows without View All
  let row = 1;
  let currentWidth = 0;

  for (let i = 0; i < pillWidths.length; i++) {
    const w = pillWidths[i];
    if (currentWidth === 0) {
      currentWidth = w;
    } else if (currentWidth + gap + w <= containerWidth) {
      currentWidth += gap + w;
    } else {
      row++;
      currentWidth = w;
    }
  }

  // If all fit in 3 rows or fewer, display all!
  if (row <= 3) {
    return skillsList.length;
  }

  // Otherwise, fill row 1 and row 2, and fill row 3 leaving room for View All
  let currentRow = 1;
  let lineWidth = 0;
  let count = 0;

  for (let i = 0; i < pillWidths.length; i++) {
    const w = pillWidths[i];
    const remainingCount = skillsList.length - (count + 1);
    const viewAllWidth = getViewAllPillWidth(remainingCount, viewAllText);

    if (currentRow === 1) {
      if (lineWidth === 0) {
        lineWidth = w;
        count++;
      } else if (lineWidth + gap + w <= containerWidth) {
        lineWidth += gap + w;
        count++;
      } else {
        // Wrap to Row 2
        currentRow = 2;
        lineWidth = w;
        count++;
      }
    } else if (currentRow === 2) {
      if (lineWidth + gap + w <= containerWidth) {
        lineWidth += gap + w;
        count++;
      } else {
        // Wrap to Row 3
        currentRow = 3;
        // Check if first item on Row 3 can fit with View All
        if (w + gap + viewAllWidth <= containerWidth) {
          lineWidth = w;
          count++;
        } else {
          // Cannot fit any skill on Row 3 alongside View All, stop at Row 2!
          break;
        }
      }
    } else if (currentRow === 3) {
      if (lineWidth + gap + w + gap + viewAllWidth <= containerWidth) {
        lineWidth += gap + w;
        count++;
      } else {
        break;
      }
    }
  }

  return Math.max(1, count);
}

interface MainAboutProps {
  profile: Profile | null;
  roles: Role[];
  about: About | null;
  contact: Contact | null;
  statistics: Statistics;
  skills: Skill[];
  skillCategories: SkillCategory[];
  locale: MainLocale;
}

export function MainAbout({
  profile,
  about,
  contact,
  skills,
  skillCategories,
  locale,
}: MainAboutProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isCvPdfOpen, setIsCvPdfOpen] = useState(false);
  const [cardWidth, setCardWidth] = useState<number>(0);
  const [skillsCardHeight, setSkillsCardHeight] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedModalCategory, setSelectedModalCategory] = useState<string>("all");
  const [activityYear, setActivityYear] = useState<number>(() => new Date().getFullYear() || 2026);
  const [hoveredActivity, setHoveredActivity] = useState<{ date: string; count: number } | null>(null);

  const skillsHeaderRef = useRef<HTMLDivElement>(null);
  const skillsCardRef = useRef<HTMLDivElement>(null);
  const pillsContainerRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const padActivityData = (data: Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }>) => {
    if (!data || data.length === 0) return data;
    const currentYear = new Date().getFullYear();
    if (activityYear !== currentYear) return data;

    const lastEntry = data[data.length - 1];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (lastEntry.date >= todayStr) return data;

    const padded = [...data];
    let curr = new Date(lastEntry.date);
    curr.setDate(curr.getDate() + 1);

    while (curr <= today) {
      const dateStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, "0")}-${String(curr.getDate()).padStart(2, "0")}`;
      padded.push({ date: dateStr, count: 0, level: 0 as const });
      curr.setDate(curr.getDate() + 1);
    }

    return padded;
  };

  const githubUsername = contact?.github_url?.replace(/\/$/, "").split("/").pop() || "fadilbafagih";

  const activeSkills = useMemo(() => skills.filter((s) => s.is_active), [skills]);
  const activeCategories = useMemo(() => skillCategories.filter((c) => c.is_active), [skillCategories]);

  const handleCategoryClick = (e: React.MouseEvent<HTMLButtonElement>, categoryId: string) => {
    setSelectedCategory(categoryId);
    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const handleModalCategoryClick = (e: React.MouseEvent<HTMLButtonElement>, categoryId: string) => {
    setSelectedModalCategory(categoryId);
    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const displaySkills = useMemo(() => {
    return selectedCategory === "all"
      ? activeSkills
      : activeSkills.filter((s) => s.category_id === selectedCategory);
  }, [activeSkills, selectedCategory]);

  const viewAllLabel = tMain(locale, "view_all");

  // Compute max preview skills based on card width
  const maxPreviewSkills = useMemo(() => {
    if (cardWidth <= 0) return 18;
    return calculate3RowFit(displaySkills, cardWidth, viewAllLabel);
  }, [displaySkills, cardWidth, viewAllLabel]);

  useLayoutEffect(() => {
    if (skillsCardRef.current && skillsCardRef.current.clientWidth > 0) {
      const isSm = window.innerWidth >= 640;
      setCardWidth(skillsCardRef.current.clientWidth - (isSm ? 40 : 32));
    }
    setMounted(true);
  }, []);

  // Keep cardWidth accurately measured via ResizeObserver and window resize
  useEffect(() => {
    const cardEl = skillsCardRef.current;
    if (!cardEl) return;

    const measure = () => {
      if (pillsContainerRef.current && pillsContainerRef.current.clientWidth > 0) {
        setCardWidth(pillsContainerRef.current.clientWidth);
      } else if (cardEl.clientWidth > 0) {
        const isSm = window.innerWidth >= 640;
        setCardWidth(cardEl.clientWidth - (isSm ? 40 : 32));
      }
    };

    const ro = new ResizeObserver(() => measure());
    ro.observe(cardEl);
    window.addEventListener("resize", measure);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(measure);
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const displayedSkillsPreview = displaySkills.slice(0, maxPreviewSkills);
  const hasMoreSkills = displaySkills.length > maxPreviewSkills;

  const modalSkills = selectedModalCategory === "all"
    ? activeSkills
    : activeSkills.filter((s) => s.category_id === selectedModalCategory);

  return (
    <section className="w-full pt-4 pb-8 md:pt-6 md:pb-12 overflow-visible">
      <div className="w-full flex flex-col gap-12">

        {/* 2. Skills Section */}
        <div className="flex flex-col">
          <motion.div 
            ref={skillsHeaderRef}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2.5">
              <Code2 className="h-[22px] w-[22px] text-neutral-900 dark:text-white" />
              <h2 className="text-[24px] leading-none font-medium tracking-tight text-neutral-900 dark:text-white">
                {tMain(locale, "skills")}
              </h2>
            </div>
            <p className="text-[15px] font-regular text-neutral-500 dark:text-neutral-400">
              {tMain(locale, "skills_desc")}
            </p>
          </motion.div>

          <motion.div 
            ref={skillsCardRef} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mt-5 rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 pt-3 pb-4 px-4 sm:pt-4 sm:pb-5 sm:px-5 transition-[height] duration-300 relative"
          >
            {/* Category Nav */}
            <div className="flex flex-row flex-nowrap items-center gap-2 mb-0 overflow-x-auto pb-3 sm:pb-4 scrollbar-custom -mx-4 sm:-mx-5 px-4 sm:px-5">
              <button
                onClick={(e) => handleCategoryClick(e, "all")}
                className={`text-sm font-semibold transition-colors whitespace-nowrap px-3.5 py-1.5 rounded-lg cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:text-neutral-900 active:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10 dark:active:text-white dark:active:bg-white/10"
                }`}
              >
                {tMain(locale, "all_skills")}
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={(e) => handleCategoryClick(e, cat.id)}
                  className={`text-sm font-semibold transition-colors whitespace-nowrap px-3.5 py-1.5 rounded-lg cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:text-neutral-900 active:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10 dark:active:text-white dark:active:bg-white/10"
                  }`}
                >
                  {locale === "id" ? cat.name_id : cat.name_en}
                </button>
              ))}
            </div>

            <hr className="border-neutral-200 dark:border-white/10 -mx-4 sm:-mx-5 mb-4 mt-0" />

            {/* Skills Pills */}
            {mounted && cardWidth > 0 ? (
              <motion.div 
                key={selectedCategory}
                ref={pillsContainerRef} 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.03
                    }
                  }
                }}
                className="flex flex-wrap gap-2 transition-opacity duration-200"
              >
                {displayedSkillsPreview.map((skill) => (
                  <motion.div 
                    key={skill.id}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { 
                        opacity: 1, 
                        y: 0,
                        transition: {
                          duration: 0.35,
                          ease: [0.16, 1, 0.3, 1]
                        }
                      }
                    }}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 bg-transparent dark:border-white/10 text-sm font-normal text-neutral-700 dark:text-neutral-300 transition-colors duration-200 hover:bg-neutral-50/50 hover:border-neutral-300 dark:hover:bg-white/3 dark:hover:border-white/20 hover:text-black dark:hover:text-white active:bg-neutral-50/50 active:border-neutral-300 dark:active:bg-white/3 dark:active:border-white/20 active:text-black dark:active:text-white"
                  >
                    {skill.icon_url ? (
                      <img 
                        src={toStorageUrl(skill.icon_url)} 
                        alt={skill.name} 
                        className="w-3.5 h-3.5 object-contain brightness-0 dark:invert transition-transform duration-200 group-hover:scale-110" 
                      />
                    ) : (
                      <Code2 className="w-3.5 h-3.5 text-black dark:text-white transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
                    )}
                    <span>{skill.name}</span>
                  </motion.div>
                ))}
                
                {/* View All Pill */}
                {hasMoreSkills && (
                  <motion.button
                    key="view-all"
                    type="button"
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { 
                        opacity: 1, 
                        y: 0,
                        transition: {
                          duration: 0.35,
                          ease: [0.16, 1, 0.3, 1]
                        }
                      }
                    }}
                    onClick={() => {
                      setSelectedModalCategory("all");
                      setIsSkillsModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-transparent text-sm font-normal text-neutral-500 hover:bg-neutral-50 active:bg-neutral-50 dark:hover:bg-white/5 dark:active:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                    <span>+{displaySkills.length - maxPreviewSkills}</span>
                    <span>{tMain(locale, "view_all")}</span>
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-wrap gap-2 min-h-[110px]" />
            )}
          </motion.div>
        </div>

        {/* 3. My Activity Section (Full Width) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-3 w-full"
        >
          {/* Header: Icon, Title & Year Nav */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <GitHubIcon className="h-[22px] w-[22px] text-neutral-900 dark:text-white" />
              <h3 className="text-[24px] leading-none font-medium tracking-tight text-neutral-900 dark:text-white">{tMain(locale, "my_activity")}</h3>
            </div>
            <div className="flex items-center gap-3 select-none">
               <button
                 onClick={() => setActivityYear((prev) => prev - 1)}
                 className="h-8 w-8 rounded-lg border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 flex items-center justify-center text-neutral-600 hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white cursor-pointer transition-colors"
                 aria-label="Previous Year"
               >
                 <ChevronLeft className="h-4 w-4" />
               </button>
               <span className="text-[15px] font-medium text-neutral-900 dark:text-white min-w-[36px] text-center">{activityYear}</span>
               <button
                 onClick={() => setActivityYear((prev) => prev + 1)}
                 disabled={activityYear >= new Date().getFullYear()}
                 className="h-8 w-8 rounded-lg border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 flex items-center justify-center text-neutral-600 hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                 aria-label="Next Year"
               >
                 <ChevronRight className="h-4 w-4" />
               </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 overflow-hidden w-full">
            <div className="w-full py-2 min-h-[140px] flex items-center justify-center overflow-x-auto max-w-full scrollbar-custom">
              {mounted ? (
                <GitHubCalendar
                  username={githubUsername}
                  year={activityYear}
                  transformData={padActivityData}
                  colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
                  blockSize={12}
                  blockMargin={4}
                  fontSize={12}
                  labels={{
                    totalCount: hoveredActivity
                      ? (locale === "id"
                          ? `${hoveredActivity.count} kontribusi pada ${formatDate(hoveredActivity.date)}`
                          : `${hoveredActivity.count} contributions on ${formatDate(hoveredActivity.date)}`)
                      : (locale === "id"
                          ? `{{count}} kontribusi di {{year}}`
                          : `{{count}} contributions in {{year}}`),
                    legend: {
                      less: locale === "id" ? "Kurang" : "Less",
                      more: locale === "id" ? "Lebih" : "More"
                    }
                  }}
                  renderBlock={(block, activity) =>
                    cloneElement(block, {
                      onMouseEnter: () => setHoveredActivity({ date: activity.date, count: activity.count }),
                      onMouseLeave: () => setHoveredActivity(null)
                    })
                  }
                />
              ) : (
                <div className="w-full h-[120px] bg-neutral-100 dark:bg-neutral-800/50 animate-pulse rounded-xl" />
              )}
            </div>
          </div>
        </motion.div>

      </div>

      <Dialog 
        open={isSkillsModalOpen} 
        onOpenChange={(open) => {
          setIsSkillsModalOpen(open);
          if (!open) {
            // Wait for modal exit transition to finish before resetting to avoid flash
            setTimeout(() => {
              setSelectedModalCategory("all");
            }, 300);
          }
        }}
      >
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg md:max-w-3xl lg:max-w-4xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 ring-0 shadow-2xl">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-1">
              <Code2 className="h-6 w-6 text-neutral-900 dark:text-white" />
              <DialogTitle className="text-2xl font-semibold tracking-tight">
                {tMain(locale, "skills")}
              </DialogTitle>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {tMain(locale, "skills_desc")}
            </p>
          </DialogHeader>
          
          <div className="w-full min-w-0 rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-white/10 pt-3 pb-0 px-4 sm:pt-4 sm:pb-0 sm:px-5 overflow-hidden">
            {/* Category Filters */}
            <div className="min-w-0 flex flex-row flex-nowrap items-center gap-2 mb-0 overflow-x-auto pb-3 sm:pb-4 scrollbar-custom -mx-4 sm:-mx-5 px-4 sm:px-5">
              <button
                onClick={(e) => handleModalCategoryClick(e, "all")}
                className={`text-sm font-semibold transition-colors whitespace-nowrap px-3.5 py-1.5 rounded-lg cursor-pointer ${
                  selectedModalCategory === "all"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:text-neutral-900 active:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10 dark:active:text-white dark:active:bg-white/10"
                }`}
              >
                {tMain(locale, "all_skills")}
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={(e) => handleModalCategoryClick(e, cat.id)}
                  className={`text-sm font-semibold transition-colors whitespace-nowrap px-3.5 py-1.5 rounded-lg cursor-pointer ${
                    selectedModalCategory === cat.id
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:text-neutral-900 active:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10 dark:active:text-white dark:active:bg-white/10"
                  }`}
                >
                  {locale === "id" ? cat.name_id : cat.name_en}
                </button>
              ))}
            </div>

            <hr className="border-neutral-200 dark:border-white/10 -mx-4 sm:-mx-5 mb-0 mt-0" />

            {/* Modal Skills List */}
            <motion.div 
              key={selectedModalCategory}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.03
                  }
                }
              }}
              className="flex flex-wrap items-center gap-2 overflow-y-auto max-h-[50vh] pt-4 pb-4 px-4 sm:pt-5 sm:pb-5 sm:px-5 -mx-4 sm:-mx-5 scrollbar-custom"
            >
              {modalSkills.map((skill) => (
                <motion.div
                  key={skill.id}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.35,
                        ease: [0.16, 1, 0.3, 1]
                      }
                    }
                  }}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 bg-transparent dark:border-white/10 text-sm font-normal text-neutral-700 dark:text-neutral-300 transition-colors duration-200 hover:bg-neutral-50/50 hover:border-neutral-300 dark:hover:bg-white/3 dark:hover:border-white/20 hover:text-black dark:hover:text-white active:bg-neutral-50/50 active:border-neutral-300 dark:active:bg-white/3 dark:active:border-white/20 active:text-black dark:active:text-white"
                >
                  {skill.icon_url ? (
                    <img 
                      src={toStorageUrl(skill.icon_url)} 
                      alt={skill.name} 
                      className="w-3.5 h-3.5 object-contain brightness-0 dark:invert transition-transform duration-200 group-hover:scale-110" 
                    />
                  ) : (
                    <Code2 className="w-3.5 h-3.5 text-black dark:text-white transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
                  )}
                  <span>{skill.name}</span>
                </motion.div>
              ))}
              {modalSkills.length === 0 && (
                <p className="text-sm text-neutral-500 italic w-full text-center py-8">
                  {tMain(locale, "no_skills_found")}
                </p>
              )}
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF CV Modal viewer */}
      {about?.cv_url && (
        <PdfViewerModal
          isOpen={isCvPdfOpen}
          onClose={() => setIsCvPdfOpen(false)}
          pdfUrl={toStorageUrl(about.cv_url)}
          fileName="Hasan-Fadlullah-CV"
        />
      )}
    </section>
  );
}
