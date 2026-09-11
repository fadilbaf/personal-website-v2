"use client";

import { useState, useEffect, useRef, cloneElement, MouseEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useTheme } from "next-themes";
import { Globe, MapPin, Download, Quote, LayoutGrid, ChevronLeft, ChevronRight, User, Code2, Eye } from "lucide-react";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Profile, Role, Contact, About, Statistics, Skill, SkillCategory } from "@/src/types/database";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GitHubCalendar } from "react-github-calendar";
import { PdfViewerModal, extractPdfFileName } from "@/components/dashboard/pdf-viewer-modal";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/** Verified badge (blue checkmark) */
function VerifiedBadge() {
  return (
    <svg className="h-5 w-5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5a.749.749 0 01-1.041.208l-.115-.094-2.415-2.415a.75.75 0 111.06-1.06l1.77 1.767 3.825-5.74a.75.75 0 011.25.833z" />
    </svg>
  );
}

import { AnimatedNumber } from "@/components/ui/animated-number";

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

const sentenceVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

function TypingQuote({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isInView || !mounted) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isInView, mounted, text]);

  return (
    <span ref={containerRef} className={`inline-block ${!mounted ? "opacity-0" : ""}`}>
      &ldquo;{mounted ? displayedText : text}&rdquo;
    </span>
  );
}

import { trackEvent } from "@/src/lib/track-event";

export function MainAbout({
  profile,
  roles,
  about,
  contact,
  statistics,
  skills,
  skillCategories,
  locale,
}: MainAboutProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Modals & States
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isCvPdfOpen, setIsCvPdfOpen] = useState(false);
  const [maxPreviewSkills, setMaxPreviewSkills] = useState(16);
  const [skillsCardHeight, setSkillsCardHeight] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedModalCategory, setSelectedModalCategory] = useState<string>("all");
  const [activityYear, setActivityYear] = useState<number>(() => new Date().getFullYear() || 2026);
  const [hoveredActivity, setHoveredActivity] = useState<{ date: string; count: number } | null>(null);

  const isModalOpenRef = useRef(false);

  const maxPreviewSkillsRef = useRef(maxPreviewSkills);
  maxPreviewSkillsRef.current = maxPreviewSkills;

  const profileCardRef = useRef<HTMLDivElement>(null);
  const githubCardRef = useRef<HTMLDivElement>(null);
  const aboutMeRef = useRef<HTMLDivElement>(null);
  const skillsHeaderRef = useRef<HTMLDivElement>(null);
  const skillsCardRef = useRef<HTMLDivElement>(null);
  const pillsContainerRef = useRef<HTMLDivElement>(null);
  const overflowLimitRef = useRef<number | null>(null);

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleCategoryClick = (e: MouseEvent<HTMLButtonElement>, categoryId: string) => {
    setSelectedCategory(categoryId);
    e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const handleModalCategoryClick = (e: MouseEvent<HTMLButtonElement>, categoryId: string) => {
    setSelectedModalCategory(categoryId);
    e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const padActivityData = (data: Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }>) => {
    const paddedData: Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }> = [];
    const d = new Date(activityYear, 0, 1);
    const dataMap = new Map(data.map((item) => [item.date, item]));

    while (d.getFullYear() === activityYear) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      if (dataMap.has(dateStr)) {
        paddedData.push(dataMap.get(dateStr)!);
      } else {
        paddedData.push({
          date: dateStr,
          count: 0,
          level: 0,
        });
      }

      d.setDate(d.getDate() + 1);
    }
    return paddedData;
  };

  const bioText = locale === "id" ? about?.description_id : about?.description_en;
  const quotesText = locale === "id" ? about?.quotes_id : about?.quotes_en;
  const currentRole = roles.length > 0 
    ? (locale === "id" ? roles[currentRoleIndex]?.role_id : roles[currentRoleIndex]?.role_en)
    : "";

  useEffect(() => {
    if (roles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  // Extract GitHub Username
  const githubUsername = contact?.github_url 
    ? contact.github_url.split("/").pop() || "FadilBaf" 
    : "FadilBaf";

  const githubChartUrl = `https://ghchart.rshah.org/${resolvedTheme === "dark" ? "10b981" : "10b981"}/${githubUsername}`;

  // Filter & Sort Active Skills & Categories (from oldest to newest)
  const activeCategories = skillCategories
    .filter((c) => c.is_active)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const activeSkills = skills
    .filter((s) => s.is_active && activeCategories.some(c => c.id === s.category_id))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Filter for display based on selected category
  const displaySkills = selectedCategory === "all"
    ? activeSkills
    : activeSkills.filter((s) => s.category_id === selectedCategory);

  const displaySkillsRef = useRef(displaySkills);
  displaySkillsRef.current = displaySkills;

  const calculateLimitGlobalRef = useRef<() => void>(undefined);

  // Track modal open state and handle closing transition delay to prevent layout thrashing
  useEffect(() => {
    if (isSkillsModalOpen) {
      isModalOpenRef.current = true;
      setSelectedModalCategory(selectedCategory);
    } else {
      const timer = setTimeout(() => {
        isModalOpenRef.current = false;
        calculateLimitGlobalRef.current?.();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isSkillsModalOpen, selectedCategory]);

  // Reset overflow limit and recalculate when category changes
  useEffect(() => {
    overflowLimitRef.current = null;
    calculateLimitGlobalRef.current?.();
  }, [selectedCategory, displaySkills.length]);

  // Resize handler to dynamically calculate preview limit to align left and right columns
  useEffect(() => {
    if (typeof window === "undefined") return;

    const calculateLimit = () => {
      // If modal is open, ignore to prevent scrollbar layout shift interference
      if (isModalOpenRef.current) return;

      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        setSkillsCardHeight(null);
      }

      if (
        githubCardRef.current &&
        skillsCardRef.current &&
        pillsContainerRef.current
      ) {
        let maxRows = 3;
        let targetCardHeight = null;

        if (!isMobile) {
          const githubRect = githubCardRef.current.getBoundingClientRect();
          const skillsCardRect = skillsCardRef.current.getBoundingClientRect();
          const pillsContainerRect = pillsContainerRef.current.getBoundingClientRect();

          // Calculate target card height to align bottom with GitHub card
          targetCardHeight = githubRect.bottom - skillsCardRect.top;

          // Available height for pills (paddingBottom = 20px)
          const paddingBottom = 20;
          const targetCardBottom = skillsCardRect.top + targetCardHeight;
          const pillsSpace = targetCardBottom - pillsContainerRect.top - paddingBottom;

          const rowHeight = 42;
          // Since we explicitly control the card height to be aligned,
          // we can use a generous tolerance (+26px) so that pills fill the card
          // nicely without leaving a large empty gap at the bottom.
          maxRows = Math.max(1, Math.floor((pillsSpace + 26) / rowHeight));
        }

        const children = Array.from(pillsContainerRef.current.children) as HTMLElement[];
        if (children.length === 0) {
          if (!isMobile && targetCardHeight !== null) {
            setSkillsCardHeight(targetCardHeight);
          }
          return;
        }

        // Group all children (including View All button) by row
        const rows: HTMLElement[][] = [];
        children.forEach((child) => {
          const lastRow = rows[rows.length - 1];
          if (!lastRow || Math.abs(lastRow[0].offsetTop - child.offsetTop) > 10) {
            rows.push([child]);
          } else {
            lastRow.push(child);
          }
        });

        const currentRows = rows.length;
        const prev = maxPreviewSkillsRef.current;
        let newLimit = prev;

        if (currentRows > maxRows) {
          // Exceeded! Slice back to only the pills that fit in maxRows.
          let count = 0;
          let viewAllIsInPreview = false;
          for (let i = 0; i < Math.min(maxRows, rows.length); i++) {
            rows[i].forEach((child) => {
              if (child.tagName === "BUTTON") {
                viewAllIsInPreview = true;
              }
            });
            count += rows[i].length;
          }
          const hasMore = displaySkillsRef.current.length > prev;
          newLimit = Math.max(4, hasMore && !viewAllIsInPreview ? count - 1 : count);
          // Record this newLimit + 1 as an overflow limit to prevent incrementing back to it
          overflowLimitRef.current = newLimit + 1;
        } else if (currentRows < maxRows) {
          // We have extra rows! We can add skills.
          if (prev < displaySkillsRef.current.length) {
            const averagePillsPerRow = Math.max(3, children.length / Math.max(1, currentRows));
            const remainingRows = maxRows - currentRows;
            newLimit = Math.min(displaySkillsRef.current.length, prev + Math.ceil(remainingRows * averagePillsPerRow));
          }
        } else {
          // We are at exactly maxRows!
          // Can we fit more in the last row?
          const lastRow = rows[rows.length - 1];
          if (lastRow && lastRow.length > 0) {
            const lastRowWidth = lastRow.reduce((sum, p) => sum + p.offsetWidth + 8, 0);
            const containerWidth = pillsContainerRef.current.offsetWidth || 400;
            const remainingWidth = containerWidth - lastRowWidth;
            
            // If the remaining width is enough to hold another pill, we increment by 1
            // BUT only if we haven't already marked it as an overflow limit!
            const targetNext = prev + 1;
            if (
              remainingWidth > 95 && 
              displaySkillsRef.current.length > prev &&
              overflowLimitRef.current !== targetNext
            ) {
              newLimit = Math.min(displaySkillsRef.current.length, targetNext);
            }
          }
        }

        if (!isMobile && targetCardHeight !== null) {
          setSkillsCardHeight(targetCardHeight);
        }
        if (newLimit !== prev) {
          setMaxPreviewSkills(newLimit);
        }
      }
    };

    calculateLimitGlobalRef.current = calculateLimit;

    // Run initially after DOM settles
    const timer = setTimeout(() => {
      calculateLimit();
    }, 100);

    const resizeObserver = new ResizeObserver(() => {
      calculateLimit();
    });

    if (profileCardRef.current) resizeObserver.observe(profileCardRef.current);
    if (githubCardRef.current) resizeObserver.observe(githubCardRef.current);
    if (aboutMeRef.current) resizeObserver.observe(aboutMeRef.current);
    if (skillsHeaderRef.current) resizeObserver.observe(skillsHeaderRef.current);
    if (skillsCardRef.current) resizeObserver.observe(skillsCardRef.current);

    window.addEventListener("resize", calculateLimit);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateLimit);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const scrollFlag = sessionStorage.getItem("scroll_to_about") === "true" || sessionStorage.getItem("scroll-target") === "about";
      if (scrollFlag) {
        setTimeout(() => {
          const element = document.getElementById("about");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  }, []);

  // Determine top dynamic preview skills, and use Modal if more than the limit
  const displayedSkillsPreview = displaySkills.slice(0, maxPreviewSkills);
  const hasMoreSkills = displaySkills.length > maxPreviewSkills;
  // Filter for Modal
  const modalSkills = selectedModalCategory === "all"
    ? activeSkills
    : activeSkills.filter((s) => s.category_id === selectedModalCategory);

  return (
    <section id="about" className="scroll-mt-20 w-full px-3.5 sm:px-12 md:px-24 lg:px-36 pt-12 pb-6 md:pt-24 md:pb-8 overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Profile, Stats, Quotes, CV, Github Activity */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* 1. Main Profile Card */}
          <motion.div 
            ref={profileCardRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5, ease: "easeOut" }
              }
            }}
            className="p-5 sm:p-6 rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 flex flex-col gap-4"
          >
            {/* Top: Avatar & Info */}
            <div className="flex flex-row items-center gap-4">
              {/* Avatar */}
              {profile?.photo_url && (
                <motion.div
                  variants={{
                    hidden: { filter: "blur(6px)", opacity: 0 },
                    visible: { filter: "blur(0px)", opacity: 1, transition: { duration: 0.4 } }
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 1.03 }}
                  className="cursor-pointer shrink-0"
                >
                  <div className="profile-photo-shimmer relative h-28 w-28 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-900">
                    {isImageLoading && (
                      <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse z-10" />
                    )}
                    <Image
                      src={profile.photo_url}
                      alt={profile.full_name || "Profile"}
                      fill
                      className="object-cover select-none profile-image-grayscale"
                      sizes="112px"
                      priority
                      onLoad={() => setIsImageLoading(false)}
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                  </div>
                </motion.div>
              )}

              {/* Info */}
              <div className="flex flex-col items-start text-left mt-1">
                <motion.h2
                  variants={{
                    hidden: { filter: "blur(6px)", opacity: 0 },
                    visible: { filter: "blur(0px)", opacity: 1, transition: { duration: 0.4 } }
                  }}
                  className="text-[26px] leading-tight font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5"
                >
                  {profile?.full_name || "Fadil Bafagih"}
                  <VerifiedBadge />
                </motion.h2>
                
                <motion.div
                  variants={{
                    hidden: { filter: "blur(6px)", opacity: 0 },
                    visible: { filter: "blur(0px)", opacity: 1, transition: { duration: 0.4 } }
                  }}
                  className="h-6 mt-1 overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentRoleIndex}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="text-[15px] font-regular text-neutral-500 dark:text-neutral-400"
                    >
                      {currentRole}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>

                {/* Desktop Badges: Location & Status (hidden on mobile, visible on sm and larger) */}
                <div className="hidden sm:flex items-center gap-2 mt-3 flex-wrap justify-start w-full">
                  {contact?.location && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200 dark:text-neutral-400 dark:border-white/10">
                      <MapPin className="h-3.5 w-3.5" />
                      {contact.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200 dark:text-neutral-400 dark:border-white/10">
                    <Globe className="h-3.5 w-3.5" />
                    Open to Remote
                  </span>
                </div>

              </div>
            </div>

            {/* Mobile Badges: Location & Status (visible on mobile, hidden on sm and larger) */}
            <div className={`grid ${contact?.location ? 'grid-cols-2' : 'grid-cols-1'} gap-2 w-full sm:hidden`}>
              {contact?.location && (
                <span className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200 dark:text-neutral-400 dark:border-white/10 w-full">
                  <MapPin className="h-3.5 w-3.5" />
                  {contact.location}
                </span>
              )}
              <span className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200 dark:text-neutral-400 dark:border-white/10 w-full">
                <Globe className="h-3.5 w-3.5" />
                Open to Remote
              </span>
            </div>

            <motion.hr 
              variants={{
                hidden: { scaleX: 0 },
                visible: { 
                  scaleX: 1, 
                  transition: { duration: 0.6, ease: "easeInOut" } 
                }
              }}
              style={{ originX: 0 }}
              className="border-neutral-200 dark:border-white/10" 
            />

             {/* Stats Row */}
            <motion.div 
              initial={{ filter: "blur(6px)", opacity: 0, y: 20 }}
              whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 text-center">
                <span className="text-[22px] leading-none font-bold text-neutral-900 dark:text-white">
                  <AnimatedNumber value={statistics.total_projects || 0} />
                </span>
                <span className="text-[11px] text-neutral-500 mt-1.5 font-medium">{tMain(locale, "total_projects")}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 text-center">
                <span className="text-[22px] leading-none font-bold text-neutral-900 dark:text-white">
                  <AnimatedNumber value={statistics.total_achievements || 0} />
                </span>
                <span className="text-[11px] text-neutral-500 mt-1.5 font-medium">{tMain(locale, "total_achievements")}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 text-center">
                <span className="text-[22px] leading-none font-bold text-neutral-900 dark:text-white">
                  <AnimatedNumber value={about?.years_of_experience || 0} />
                </span>
                <span className="text-[11px] text-neutral-500 mt-1.5 font-medium">{tMain(locale, "years_experience")}</span>
              </div>
            </motion.div>

            {/* Quotes */}
            {quotesText && (
              <motion.div 
                initial={{ filter: "blur(6px)", opacity: 0, y: 20 }}
                whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                className="py-3 px-4 rounded-xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 text-center flex flex-col items-center justify-center"
              >
                <div className="flex items-start gap-2 justify-center">
                  <Quote className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500 shrink-0 mt-1" strokeWidth={1.5} />
                  <p className="text-[15px] font-medium text-neutral-900 dark:text-white font-sans leading-relaxed text-left">
                    <TypingQuote text={quotesText} />
                  </p>
                </div>
              </motion.div>
            )}

            {/* Download / View CV Button */}
            {about?.cv_url && (
              <motion.button
                type="button"
                initial={{ filter: "blur(6px)", opacity: 0, y: 20 }}
                whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  trackEvent("cv_download");
                  setIsCvPdfOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-black px-4 py-3 text-[15px] font-semibold text-white transition-colors duration-200 dark:bg-white dark:text-neutral-900 cursor-pointer"
              >
                <Download className="h-5 w-5" />
                {tMain(locale, "download_cv")}
              </motion.button>
            )}
          </motion.div>

          {/* 2. Github Activity Section */}
          <motion.div 
            ref={githubCardRef}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-3"
          >
            {/* Header: Icon, Title & Year Nav (Outside the box) */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <GitHubIcon className="h-[22px] w-[22px] text-neutral-900 dark:text-white" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">{tMain(locale, "my_activity")}</h3>
              </div>
              <div className="flex items-center gap-3 select-none">
                 <button
                   onClick={() => setActivityYear((prev) => prev - 1)}
                   className="h-8 w-8 rounded-lg border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 flex items-center justify-center text-neutral-600 hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white cursor-pointer transition-colors"
                 >
                   <ChevronLeft className="h-4 w-4" />
                 </button>
                 <span className="text-[15px] font-medium text-neutral-900 dark:text-white min-w-[36px] text-center">{activityYear}</span>
                 <button
                   onClick={() => setActivityYear((prev) => prev + 1)}
                   disabled={activityYear >= new Date().getFullYear()}
                   className="h-8 w-8 rounded-lg border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 flex items-center justify-center text-neutral-600 hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                   <ChevronRight className="h-4 w-4" />
                 </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 overflow-hidden">
              <div className="w-full py-2 min-h-[140px] flex items-center overflow-x-auto max-w-full scrollbar-custom">
                {mounted ? (
                  <GitHubCalendar
                    username={githubUsername}
                    year={activityYear}
                    transformData={padActivityData}
                    colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
                    blockSize={11}
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

        {/* ========================================================= */}
        {/* RIGHT COLUMN: About Me, Skills */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          
          {/* About Me Section */}
          <div className="flex flex-col">
            <motion.div 
              ref={aboutMeRef}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-2.5">
                <User className="h-[22px] w-[22px] text-neutral-900 dark:text-white" />
                <h2 className="text-[24px] leading-none font-medium tracking-tight text-neutral-900 dark:text-white">
                  {tMain(locale, "about_me")}
                </h2>
              </div>
              <p className="text-[15px] font-regular text-neutral-500 dark:text-neutral-400">
                {tMain(locale, "about_subtitle")}
              </p>
            </motion.div>
            
            <motion.hr 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ originX: 0 }}
              className="border-neutral-200 dark:border-white/10 my-3" 
            />

            {bioText && (
              <motion.div 
                initial={{ filter: "blur(8px)", opacity: 0, y: 20 }}
                whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                className="prose prose-neutral dark:prose-invert max-w-none text-[15px] text-neutral-600 dark:text-neutral-400 leading-[1.8]"
                dangerouslySetInnerHTML={{ __html: bioText.replace(/\n/g, '<br />') }}
              />
            )}
          </div>

          {/* Skills Section */}
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
              style={skillsCardHeight && hasMoreSkills ? { height: `${skillsCardHeight}px` } : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="mt-5 rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 pt-3 pb-4 px-4 sm:pt-4 sm:pb-5 sm:px-5 transition-[height] duration-300"
            >
              
              {/* Category Nav */}
              <div className="flex flex-row flex-nowrap items-center gap-2 mb-0 overflow-x-auto pb-3 sm:pb-4 scrollbar-custom -mx-4 sm:-mx-5 px-4 sm:px-5">
                <button
                  onClick={(e) => handleCategoryClick(e, "all")}
                  className={`text-sm font-semibold transition-colors whitespace-nowrap px-3.5 py-1.5 rounded-lg ${
                    selectedCategory === "all"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:text-neutral-900 active:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10 dark:active:text-white dark:active:bg-white/10"
                  }`}
                >
                  {tMain(locale, "all_skills")}
                </button>
                {activeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={(e) => handleCategoryClick(e, cat.id)}
                    className={`text-sm font-semibold transition-colors whitespace-nowrap px-3.5 py-1.5 rounded-lg ${
                      selectedCategory === cat.id
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:text-neutral-900 active:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10 dark:active:text-white dark:active:bg-white/10"
                    }`}
                  >
                    {locale === "id" ? cat.name_id : cat.name_en}
                  </button>
                ))}
              </div>

              <hr className="border-neutral-200 dark:border-white/10 -mx-4 sm:-mx-5 mb-4 mt-0" />

              {/* Skills Pills */}
              <motion.div 
                key={selectedCategory}
                ref={pillsContainerRef} 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.03
                    }
                  }
                }}
                className="flex flex-wrap gap-2"
              >
                {displayedSkillsPreview.map((skill) => (
                  <motion.div 
                    key={skill.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, filter: "blur(6px)", y: 6 },
                      visible: { 
                        opacity: 1, 
                        filter: "blur(0px)", 
                        y: 0,
                        transition: {
                          duration: 0.4,
                          ease: "easeOut"
                        }
                      }
                    }}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 bg-transparent dark:border-white/10 text-sm font-normal text-neutral-700 dark:text-neutral-300 transition-colors duration-200 hover:bg-neutral-50/50 hover:border-neutral-300 dark:hover:bg-white/3 dark:hover:border-white/20 hover:text-black dark:hover:text-white active:bg-neutral-50/50 active:border-neutral-300 dark:active:bg-white/3 dark:active:border-white/20 active:text-black dark:active:text-white"
                  >
                    {skill.icon_url ? (
                      <img 
                        src={skill.icon_url} 
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
                    variants={{
                      hidden: { opacity: 0, filter: "blur(6px)", y: 6 },
                      visible: { 
                        opacity: 1, 
                        filter: "blur(0px)", 
                        y: 0,
                        transition: {
                          duration: 0.4,
                          ease: "easeOut"
                        }
                      }
                    }}
                    onClick={() => setIsSkillsModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-transparent text-sm font-normal text-neutral-500 hover:bg-neutral-50 active:bg-neutral-50 dark:hover:bg-white/5 dark:active:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                    <span>+{displaySkills.length - maxPreviewSkills}</span>
                    <span>{tMain(locale, "view_all")}</span>
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Skills Modal using shadcn Dialog */}
      <Dialog open={isSkillsModalOpen} onOpenChange={setIsSkillsModalOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg md:max-w-3xl lg:max-w-4xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-white/10 ring-0 shadow-2xl">
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
          
          <div className="w-full min-w-0 rounded-2xl border border-neutral-200 bg-neutral-50/50 dark:border-white/10 dark:bg-neutral-950/20 pt-3 pb-0 px-4 sm:pt-4 sm:pb-0 sm:px-5 overflow-hidden">
            {/* Category Filters */}
            <div className="min-w-0 flex flex-row flex-nowrap items-center gap-2 mb-0 overflow-x-auto pb-3 sm:pb-4 scrollbar-custom -mx-4 sm:-mx-5 px-4 sm:px-5">
              <button
                onClick={(e) => handleModalCategoryClick(e, "all")}
                className={`text-sm font-semibold transition-colors whitespace-nowrap px-3.5 py-1.5 rounded-lg ${
                  selectedModalCategory === "all"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:text-neutral-900 active:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10 dark:active:text-white dark:active:bg-white/10"
                }`}
              >
                {tMain(locale, "all_skills")}
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={(e) => handleModalCategoryClick(e, cat.id)}
                  className={`text-sm font-semibold transition-colors whitespace-nowrap px-3.5 py-1.5 rounded-lg ${
                    selectedModalCategory === cat.id
                      ? "bg-black text-white dark:bg-white dark:text-black"
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
                  layout
                  variants={{
                    hidden: { opacity: 0, filter: "blur(6px)", y: 6 },
                    visible: { 
                      opacity: 1, 
                      filter: "blur(0px)", 
                      y: 0,
                      transition: {
                        duration: 0.4,
                        ease: "easeOut"
                      }
                    }
                  }}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 bg-transparent dark:border-white/10 text-sm font-normal text-neutral-700 dark:text-neutral-300 transition-colors duration-200 hover:bg-neutral-50/50 hover:border-neutral-300 dark:hover:bg-white/3 dark:hover:border-white/20 hover:text-black dark:hover:text-white active:bg-neutral-50/50 active:border-neutral-300 dark:active:bg-white/3 dark:active:border-white/20 active:text-black dark:active:text-white"
                >
                  {skill.icon_url ? (
                    <img 
                      src={skill.icon_url} 
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
                  No skills found in this category.
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
          pdfUrl={about.cv_url}
          fileName={extractPdfFileName(about.cv_url, "CV.pdf")}
        />
      )}
    </section>
  );
}
