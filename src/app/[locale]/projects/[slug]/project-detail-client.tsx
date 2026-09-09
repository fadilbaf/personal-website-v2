"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  PlayCircle,
  Share2,
  Star,
  Image as ImageIcon,
  Code2,
  ChevronLeft,
  ChevronRight,
  X,
  Copy
} from "lucide-react";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import { tLinks } from "@/src/lib/links-translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { Project, Contact } from "@/src/types/database";
import { trackEvent } from "@/src/lib/track-event";
import { cn } from "@/src/app/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function getEmbedUrl(url: string | null | undefined) {
  if (!url) return null;
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  }
  const vimeoRegex = /(?:vimeo\.com\/(?:video\/)?)([0-9]+)/i;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return null;
}

interface ProjectDetailClientProps {
  project: Project;
  contact: Contact | null;
  locale: MainLocale;
}

export function ProjectDetailClient({ project, contact, locale }: ProjectDetailClientProps) {
  const images = project.project_images || [];
  const hasMultiple = images.length > 1;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const bottomStripRef = useRef<HTMLDivElement>(null);

  // States & Refs for Fullscreen Image Viewer Modal
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);
  const viewerStripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeViewerUrl = images[viewerIndex]?.image_url || "";

  // Transparency check helper
  useEffect(() => {
    if (!activeViewerUrl) {
      setIsTransparent(false);
      return;
    }

    const isTransparentExt = /\.(png|svg|webp)($|\?)/i.test(activeViewerUrl) ||
      activeViewerUrl.startsWith("data:image/svg") ||
      activeViewerUrl.startsWith("data:image/png");

    if (!isTransparentExt) {
      setIsTransparent(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = Math.min(img.width, 50);
        canvas.height = Math.min(img.height, 50);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsTransparent(isTransparentExt);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; i < imageData.length; i += 4) {
          if (imageData[i] < 254) {
            setIsTransparent(true);
            return;
          }
        }
        setIsTransparent(false);
      } catch (e) {
        setIsTransparent(isTransparentExt);
      }
    };
    img.onerror = () => {
      setIsTransparent(false);
    };
    img.src = activeViewerUrl;
  }, [activeViewerUrl]);

  // Center active thumbnail in bottom gallery strip inside full screen viewer
  useEffect(() => {
    if (viewerStripRef.current) {
      const activeElement = viewerStripRef.current.children[viewerIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [viewerIndex]);

  // Keyboard navigation inside full screen viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setViewerOpen(false);
      } else if (e.key === "ArrowLeft" && viewerIndex > 0) {
        setViewerIndex((prev) => prev - 1);
      } else if (e.key === "ArrowRight" && viewerIndex < images.length - 1) {
        setViewerIndex((prev) => prev + 1);
      }
    };

    if (viewerOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [viewerOpen, viewerIndex, images.length]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(tLinks(locale as any, "copied"), {
        description: tLinks(locale as any, "copied_desc"),
      });
      setDropdownOpen(false);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success(tLinks(locale as any, "copied"), {
        description: tLinks(locale as any, "copied_desc"),
      });
      setDropdownOpen(false);
    }
  };

  const handleSocialShare = (platform: "X" | "Facebook" | "LinkedIn") => {
    const url = window.location.href;
    const projectTitle = locale === "id" ? project.title_id : project.title_en;
    const text =
      locale === "id"
        ? `Lihat proyek ini: ${projectTitle}`
        : `Check out this project: ${projectTitle}`;

    let shareUrl = "";
    if (platform === "X") {
      shareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    } else if (platform === "Facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === "LinkedIn") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
      setDropdownOpen(false);
    }
  };

  const shareChannels = [
    { name: "X" as const, icon: XIcon, label: "X" },
    { name: "Facebook" as const, icon: FacebookIcon, label: "Facebook" },
    { name: "LinkedIn" as const, icon: LinkedInIcon, label: "LinkedIn" },
  ];
  // Sync scroll on thumbnail reel
  useEffect(() => {
    if (bottomStripRef.current) {
      const activeElement = bottomStripRef.current.children[currentIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex]);

  // Prevent background scrolling & handle Escape key for Video Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVideoOpen(false);
      }
    };

    if (videoOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [videoOpen]);

  // Format date
  const formatDate = (dateStr: string | null, activeLocale: MainLocale): string => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(activeLocale === "en" ? "en-US" : "id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to render bold text split by **
  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <strong key={i} className="font-semibold text-neutral-800 dark:text-neutral-200">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  // Helper to render text with custom paragraph spacing for newlines
  const renderParagraphs = (text: string) => {
    return text.split("\n").map((line, idx) => {
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs sm:text-sm font-normal text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {renderBoldText(line)}
        </p>
      );
    });
  };

  const title = locale === "id" ? project.title_id : project.title_en;
  const bio = locale === "id" ? project.bio_id : project.bio_en;
  const overview = locale === "id" ? project.overview_id : project.overview_en;
  const formattedDate = formatDate(project.project_date, locale);

  const challengeIntro = locale === "id" ? project.challenge_intro_id : project.challenge_intro_en;
  const challengePoints = locale === "id" ? project.challenge_points_id : project.challenge_points_en;

  const resultIntro = locale === "id" ? project.result_intro_id : project.result_intro_en;
  const resultPoints = locale === "id" ? project.result_points_id : project.result_points_en;

  const lessonIntro = locale === "id" ? project.lesson_intro_id : project.lesson_intro_en;
  const lessonPoints = locale === "id" ? project.lesson_points_id : project.lesson_points_en;

  const [backUrl, setBackUrl] = useState(`/${locale}`);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prevPage = sessionStorage.getItem("prev_project_page");
      if (prevPage === "all") {
        setBackUrl(`/${locale}/projects`);
      } else {
        setBackUrl(`/${locale}`);
      }
    }
  }, [locale]);

  const actionBtnClass = cn(
    "inline-flex items-center gap-1.5",
    "text-xs font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white",
    "transition-colors cursor-pointer select-none"
  );

  return (
    <div className="w-full px-3.5 sm:px-12 md:px-24 lg:px-36 py-8 bg-transparent">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col">
        {/* 1. Back button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href={backUrl}
            onClick={() => {
              if (typeof window !== "undefined") {
                const prevPage = sessionStorage.getItem("prev_project_page");
                if (prevPage === "home" || !prevPage) {
                  sessionStorage.setItem("scroll_to_projects", "true");
                }
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{tMain(locale, "back")}</span>
          </Link>
        </motion.div>

        {/* 2. Title & Bio */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-5 text-left"
        >
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h1>
          {bio && (
            <p className="text-[15px] font-regular text-neutral-500 dark:text-neutral-400 mt-2">
              {bio}
            </p>
          )}
        </motion.div>

        {/* 3. Metadata & Action Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-6 md:flex-row md:items-center justify-between py-3.5 border-y border-neutral-200 dark:border-white/10 mt-6"
        >
          {/* Left: Metadata */}
          <div className="grid grid-cols-3 gap-4 md:flex md:flex-row md:items-center md:gap-12 w-full md:w-auto">
            <div>
              <span className="block text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMain(locale, "type_label")}
              </span>
              <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 mt-1 block">
                {(locale === "id" ? project.type?.name_id : project.type?.name_en) || "-"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMain(locale, "category_label")}
              </span>
              <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 mt-1 block">
                {(locale === "id" ? project.category?.name_id : project.category?.name_en) || "-"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMain(locale, "date_label")}
              </span>
              <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 mt-1 block">
                {formattedDate || "-"}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 w-full md:w-auto md:flex-row md:items-center md:gap-6">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("project_click", project.slug + "-source")}
                className={actionBtnClass}
              >
                <GithubIcon className="h-4 w-4 shrink-0" />
                <span>{tMain(locale, "source_code")}</span>
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("project_click", project.slug + "-live")}
                className={actionBtnClass}
              >
                <Globe className="h-4 w-4 shrink-0" />
                <span>{tMain(locale, "live_demo")}</span>
              </a>
            )}
            {project.video_url && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setVideoOpen(true);
                  trackEvent("project_click", project.slug + "-video");
                }}
                className={actionBtnClass}
              >
                <PlayCircle className="h-4 w-4 shrink-0" />
                <span>{tMain(locale, "video_demo")}</span>
              </button>
            )}
            <DropdownMenu onOpenChange={setDropdownOpen} open={dropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={() => trackEvent("project_click", project.slug + "-share")}
                  className={cn(
                    actionBtnClass,
                    "data-[state=open]:text-neutral-900 dark:data-[state=open]:text-white outline-none"
                  )}
                >
                  <Share2 className="h-4 w-4 shrink-0" />
                  <span>{tMain(locale, "share")}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[200px] p-2.5"
              >
                <div className="text-xs font-semibold px-0 pt-0.5 pb-2 text-neutral-500 dark:text-neutral-400">
                  {tLinks(locale as any, "share_links")}
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {shareChannels.map(({ name, icon: Icon, label }) => (
                    <button
                      key={name}
                      onClick={() => handleSocialShare(name)}
                      className="flex h-9 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-600 transition-all duration-200 hover:bg-neutral-100 hover:scale-105 active:bg-neutral-100 active:scale-105 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:active:bg-neutral-700 cursor-pointer"
                      aria-label={label}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 transition-all hover:bg-neutral-100 active:bg-neutral-100 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:active:bg-neutral-700 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {tLinks(locale as any, "copy_url")}
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* 4. Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mt-8">

          {/* Kolom Kiri: Deskripsi & Deep Dives */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-7 text-left space-y-8 order-2 lg:order-1"
          >
            {/* Overview */}
            {overview && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {tMain(locale, "overview")}
                </h2>
                <div className="space-y-1">
                  {renderParagraphs(overview)}
                </div>
              </div>
            )}

            {/* Challenges & Solutions */}
            {(challengeIntro || (challengePoints && challengePoints.length > 0)) && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {tMain(locale, "challenges_solutions")}
                </h2>
                {challengeIntro && (
                  <div className="space-y-1">
                    {renderParagraphs(challengeIntro)}
                  </div>
                )}
                {challengePoints && challengePoints.length > 0 && (
                  <div className="space-y-2.5 pl-1">
                    {challengePoints.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 dark:bg-neutral-200 mt-[7.5px] shrink-0" />
                        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                          {renderBoldText(pt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Key Responsibilities */}
            {project.project_responsibilities && project.project_responsibilities.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {tMain(locale, "key_responsibilities")}
                </h2>
                <div className="space-y-2.5 pl-1">
                  {project.project_responsibilities.map((resp) => (
                    <div key={resp.id} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 dark:bg-neutral-200 mt-[7.5px] shrink-0" />
                      <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        {locale === "id" ? resp.content_id : resp.content_en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Result & Outcomes */}
            {(resultIntro || (resultPoints && resultPoints.length > 0)) && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {tMain(locale, "result_outcomes")}
                </h2>
                {resultIntro && (
                  <div className="space-y-1">
                    {renderParagraphs(resultIntro)}
                  </div>
                )}
                {resultPoints && resultPoints.length > 0 && (
                  <div className="space-y-2.5 pl-1">
                    {resultPoints.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 dark:bg-neutral-200 mt-[7.5px] shrink-0" />
                        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                          {renderBoldText(pt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lessons Learned */}
            {(lessonIntro || (lessonPoints && lessonPoints.length > 0)) && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {tMain(locale, "lessons_learned")}
                </h2>
                {lessonIntro && (
                  <div className="space-y-1">
                    {renderParagraphs(lessonIntro)}
                  </div>
                )}
                {lessonPoints && lessonPoints.length > 0 && (
                  <div className="space-y-2.5 pl-1">
                    {lessonPoints.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 dark:bg-neutral-200 mt-[7.5px] shrink-0" />
                        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                          {renderBoldText(pt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Technologies Used */}
            {project.project_skills && project.project_skills.length > 0 && (
              <div className="space-y-3 pt-2">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {tMain(locale, "technologies_used")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.project_skills.map(({ skill_id, skill }) => {
                    if (!skill) return null;
                    return (
                      <div
                        key={skill_id}
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
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Kolom Rantai Kanan: Carousel & Card stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-5 space-y-6 order-1 lg:order-2"
          >
            {/* Carousel */}
            <div className="w-full flex flex-col">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center group select-none">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentIndex].image_url}
                      alt={`Project Image ${currentIndex + 1}`}
                      className="w-full h-full object-cover transition-all duration-300 cursor-zoom-in hover:scale-[1.01]"
                      onClick={() => {
                        setViewerIndex(currentIndex);
                        setViewerOpen(true);
                      }}
                    />
                    {hasMultiple && (
                      <>
                        {/* Left arrow */}
                        <button
                          onClick={() => setCurrentIndex((prev) => prev - 1)}
                          disabled={currentIndex === 0}
                          className={cn(
                            "absolute left-3.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9.5 h-9.5 rounded-xl",
                            "bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md",
                            "border border-neutral-300 dark:border-neutral-600",
                            "text-neutral-950 dark:text-neutral-50",
                            "transition-all duration-200 outline-none group",
                            currentIndex === 0
                              ? "opacity-30 cursor-not-allowed pointer-events-none"
                              : "hover:bg-white/90 active:bg-white/90 dark:hover:bg-neutral-800/90 dark:active:bg-neutral-800/90 active:scale-95 cursor-pointer opacity-100"
                          )}
                          title="Previous Image"
                        >
                          <ChevronLeft className="w-4.5 h-4.5 stroke-[2.5]" />
                        </button>

                        {/* Right arrow */}
                        <button
                          onClick={() => setCurrentIndex((prev) => prev + 1)}
                          disabled={currentIndex === images.length - 1}
                          className={cn(
                            "absolute right-3.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9.5 h-9.5 rounded-xl",
                            "bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md",
                            "border border-neutral-300 dark:border-neutral-600",
                            "text-neutral-950 dark:text-neutral-50",
                            "transition-all duration-200 outline-none group",
                            currentIndex === images.length - 1
                              ? "opacity-30 cursor-not-allowed pointer-events-none"
                              : "hover:bg-white/90 active:bg-white/90 dark:hover:bg-neutral-800/90 dark:active:bg-neutral-800/90 active:scale-95 cursor-pointer opacity-100"
                          )}
                          title="Next Image"
                        >
                          <ChevronRight className="w-4.5 h-4.5 stroke-[2.5]" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 gap-3 text-center">
                    <ImageIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-700 stroke-[1.5]" />
                    <span className="text-xs text-neutral-400">No images available</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {hasMultiple && (
                <div className="w-full flex justify-center mt-3.5">
                  <div
                    ref={bottomStripRef}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-2xl max-w-full",
                      "bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md",
                      "border border-neutral-300 dark:border-neutral-600",
                      "overflow-x-auto scrollbar-none scroll-smooth"
                    )}
                    style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
                  >
                    {images.map((item, idx) => {
                      const isActive = idx === currentIndex;
                      return (
                        <button
                          key={item.id || idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={cn(
                            "relative w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden shrink-0 transition-all duration-200 cursor-pointer select-none",
                            isActive
                              ? "ring-2 ring-neutral-900 dark:ring-white border-transparent opacity-100"
                              : "opacity-40 hover:opacity-85 active:opacity-85"
                          )}
                        >
                          <img
                            src={item.image_url}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Statistics (Row of 3 cards) */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 text-center">
                <span className="text-[22px] leading-none font-bold text-neutral-900 dark:text-white">
                  <AnimatedNumber value={project.project_responsibilities?.length || 0} />
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 font-medium">
                  {tMain(locale, "responsibilities_stat")}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 text-center">
                <span className="text-[22px] leading-none font-bold text-neutral-900 dark:text-white">
                  <AnimatedNumber value={project.project_features?.length || 0} />
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 font-medium">
                  {tMain(locale, "features_stat")}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 text-center">
                <span className="text-[22px] leading-none font-bold text-neutral-900 dark:text-white">
                  <AnimatedNumber value={project.project_skills?.length || 0} />
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 font-medium">
                  {tMain(locale, "technologies_stat")}
                </span>
              </div>
            </div>

            {/* Key Features Card */}
            {project.project_features && project.project_features.length > 0 && (
              <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 p-5 text-left space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-neutral-900 dark:text-white fill-neutral-900 dark:fill-white shrink-0" />
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {tMain(locale, "key_features")}
                  </h3>
                </div>
                <div className="space-y-3 pl-1">
                  {[...project.project_features]
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((feat) => {
                      const featTitle = locale === "id" ? feat.title_id : feat.title_en;
                      const featDesc = locale === "id" ? feat.description_id : feat.description_en;
                      return (
                        <div key={feat.id} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 dark:bg-neutral-200 mt-[7.5px] shrink-0" />
                          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                            <strong className="font-semibold text-neutral-800 dark:text-neutral-200">
                              {featTitle}
                            </strong>{" "}
                            — {featDesc}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          </motion.div>
        </div>

      </div>

      {/* 5. Video Demo Overlay Modal */}
      {videoOpen && (
        <div className="fixed inset-0 isolate z-50 flex items-center justify-center p-4">
          {/* Glassmorphic Backdrop */}
          <div
            onClick={() => setVideoOpen(false)}
            className="fixed inset-0 bg-black/10 backdrop-blur-xs cursor-pointer"
          />

          {/* Close Button (Top-Right) */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-60">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <button
                    onClick={(e) => {
                      e.currentTarget.blur();
                      setVideoOpen(false);
                    }}
                    type="button"
                    className={cn(
                      "relative flex items-center justify-center w-12 h-12 rounded-xl sm:rounded-2xl",
                      "bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md",
                      "border border-neutral-300 dark:border-neutral-600 shadow-lg",
                      "text-neutral-950 dark:text-neutral-50",
                      "hover:bg-white/90 active:bg-white/90 dark:hover:bg-neutral-800/90 dark:active:bg-neutral-800/90 active:scale-95",
                      "transition-all duration-200 cursor-pointer outline-none group"
                    )}
                    aria-label={locale === "id" ? "Tutup" : "Close"}
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="z-70">
                  <p>{locale === "id" ? "Tutup" : "Close"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Video Viewport Container */}
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-neutral-300 dark:border-neutral-700 z-50 pointer-events-auto bg-transparent">
            {(() => {
              const embedUrl = getEmbedUrl(project.video_url);
              if (embedUrl) {
                return (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                );
              } else {
                return (
                  <video
                    src={project.video_url || undefined}
                    className="w-full h-full border-0 object-cover"
                    controls
                    autoPlay
                  />
                );
              }
            })()}
          </div>
        </div>
      )}

      {/* 6. Fullscreen Image Viewer Modal */}
      {viewerOpen && mounted && createPortal(
        <TooltipProvider>
          <div className="fixed inset-0 isolate z-50 flex items-center justify-center p-4">
            {/* Premium Glassmorphic Backdrop */}
            <div
              onClick={() => setViewerOpen(false)}
              className="fixed inset-0 bg-black/10 backdrop-blur-xs cursor-pointer"
            />

            {/* Floating Control Buttons (Top-Right) */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-60">
              <Tooltip>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <button
                    onClick={(e) => {
                      e.currentTarget.blur();
                      setViewerOpen(false);
                    }}
                    type="button"
                    className={cn(
                      "relative flex items-center justify-center w-12 h-12 rounded-xl sm:rounded-2xl",
                      "bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md",
                      "border border-neutral-300 dark:border-neutral-600 shadow-lg",
                      "text-neutral-950 dark:text-neutral-50",
                      "hover:bg-white/90 active:bg-white/90 dark:hover:bg-neutral-800/90 dark:active:bg-neutral-800/90 active:scale-95",
                      "transition-all duration-200 cursor-pointer outline-none group"
                    )}
                    aria-label={locale === "id" ? "Tutup" : "Close"}
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="z-70">
                  <p>{locale === "id" ? "Tutup" : "Close"}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Floating Left Navigation Chevron */}
            {hasMultiple && (
              <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-60">
                <Tooltip>
                  <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                    <button
                      onClick={(e) => {
                        e.currentTarget.blur();
                        setViewerIndex((prev) => prev - 1);
                      }}
                      disabled={viewerIndex === 0}
                      type="button"
                      className={cn(
                        "relative flex items-center justify-center w-12 h-12 rounded-xl sm:rounded-2xl",
                        "bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md",
                        "border border-neutral-300 dark:border-neutral-600 shadow-lg",
                        "text-neutral-950 dark:text-neutral-50",
                        "transition-all duration-200 outline-none group",
                        viewerIndex === 0
                          ? "opacity-30 cursor-not-allowed pointer-events-none"
                          : "hover:bg-white/90 active:bg-white/90 dark:hover:bg-neutral-800/90 dark:active:bg-neutral-800/90 active:scale-95 cursor-pointer"
                      )}
                      aria-label={locale === "id" ? "Sebelumnya" : "Previous"}
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </TooltipTrigger>
                  {viewerIndex > 0 && (
                    <TooltipContent side="right" className="z-70">
                      <p>{locale === "id" ? "Sebelumnya" : "Previous"}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            )}

            {/* Floating Right Navigation Chevron */}
            {hasMultiple && (
              <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-60">
                <Tooltip>
                  <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                    <button
                      onClick={(e) => {
                        e.currentTarget.blur();
                        setViewerIndex((prev) => prev + 1);
                      }}
                      disabled={viewerIndex === images.length - 1}
                      type="button"
                      className={cn(
                        "relative flex items-center justify-center w-12 h-12 rounded-xl sm:rounded-2xl",
                        "bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md",
                        "border border-neutral-300 dark:border-neutral-600 shadow-lg",
                        "text-neutral-950 dark:text-neutral-50",
                        "transition-all duration-200 outline-none group",
                        viewerIndex === images.length - 1
                          ? "opacity-30 cursor-not-allowed pointer-events-none"
                          : "hover:bg-white/90 active:bg-white/90 dark:hover:bg-neutral-800/90 dark:active:bg-neutral-800/90 active:scale-95 cursor-pointer"
                      )}
                      aria-label={locale === "id" ? "Selanjutnya" : "Next"}
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </TooltipTrigger>
                  {viewerIndex < images.length - 1 && (
                    <TooltipContent side="left" className="z-70">
                      <p>{locale === "id" ? "Selanjutnya" : "Next"}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            )}

          {/* Primary Image Viewport Container */}
          <div className="relative w-full max-w-[85vw] h-[68vh] flex items-center justify-center z-50 pointer-events-none select-none">
            {activeViewerUrl ? (
              <img
                src={activeViewerUrl}
                alt={`Viewer Image ${viewerIndex + 1}`}
                className={cn(
                  "max-w-full max-h-full object-contain rounded-2xl pointer-events-auto select-none transition-all duration-300",
                  isTransparent
                    ? ""
                    : "shadow-2xl border border-neutral-200/10 dark:border-neutral-800/10"
                )}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/40 dark:bg-neutral-800/40 backdrop-blur-md border border-neutral-200/20 dark:border-neutral-800/20 shadow-2xl pointer-events-auto select-none max-w-sm w-full gap-4 text-center">
                <div className="p-6 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-full flex items-center justify-center text-neutral-400 dark:text-neutral-500">
                  <ImageIcon className="w-16 h-16 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-neutral-900 dark:text-white text-base">
                    {locale === "id" ? "Tidak ada gambar" : "No image available"}
                  </h4>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Gallery Thumbnail Strip */}
          {hasMultiple && (
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-60 max-w-[85vw]">
              <div
                ref={viewerStripRef}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-2xl sm:rounded-3xl",
                  "bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md",
                  "border border-neutral-300 dark:border-neutral-600 shadow-xl",
                  "overflow-x-auto scrollbar-none scroll-smooth"
                )}
                style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
              >
                {images.map((item, idx) => {
                  const url = item.image_url;
                  const isActive = idx === viewerIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setViewerIndex(idx)}
                      className={cn(
                        "relative w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden shrink-0 transition-all duration-200 cursor-pointer select-none",
                        isActive
                          ? "ring-2 ring-neutral-900 dark:ring-white border-transparent opacity-100"
                          : "opacity-40 hover:opacity-85 active:opacity-85"
                      )}
                      title={locale === "id" ? `Lihat gambar ${idx + 1}` : `View image ${idx + 1}`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>,
        document.body
      )}
    </div>
  );
}
