"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Briefcase,
  FolderGit2,
  Award,
  BookOpen,
  Mail,
  Link2,
  ArrowRight,
  Share2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import { tLinks } from "@/src/lib/links-translations";
import type { Profile, Role, Contact, About } from "@/src/types/database";
import { toStorageUrl } from "@/src/lib/storage-url";
import { ThemeModeToggle } from "@/src/components/main/theme-mode-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trackEvent } from "@/src/lib/track-event";

/** Verified badge (blue checkmark) */
function VerifiedBadge() {
  return (
    <svg className="h-5 w-5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5a.749.749 0 01-1.041.208l-.115-.094-2.415-2.415a.75.75 0 111.06-1.06l1.77 1.767 3.825-5.74a.75.75 0 011.25.833z" />
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.101-.477-.15-.678.15-.201.3-.778.98-.954 1.18-.176.2-.352.226-.653.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.352.452-.528.15-.176.201-.301.301-.502.101-.201.05-.377-.025-.528-.075-.15-.678-1.633-.929-2.238-.244-.589-.493-.509-.678-.519l-.578-.01c-.201 0-.528.075-.804.377s-1.055 1.03-1.055 2.512 1.08 2.914 1.231 3.115c.151.201 2.126 3.246 5.15 4.553.719.311 1.281.497 1.719.636.723.23 1.381.197 1.902.12.58-.087 1.782-.728 2.033-1.431.251-.703.251-1.306.176-1.431-.075-.126-.276-.201-.577-.352zm-5.467 7.618a9.98 9.98 0 01-5.1-1.393l-.366-.217-3.791.995 1.013-3.696-.238-.379a9.97 9.97 0 01-1.533-5.31c0-5.523 4.492-10.015 10.015-10.015 2.676 0 5.19 1.042 7.081 2.934a9.96 9.96 0 012.934 7.081c0 5.524-4.492 10.015-10.015 10.015zm8.535-18.55A12.01 12.01 0 0012.005 0C5.38 0 .005 5.375.005 12c0 2.115.553 4.181 1.604 6.002L0 24l6.177-1.62a11.96 11.96 0 005.828 1.62c6.625 0 12-5.375 12-12 0-3.206-1.248-6.22-3.513-8.485z" />
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 192 192" fill="currentColor">
      <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
    </svg>
  );
}

interface MainSidebarProps {
  profile: Profile | null;
  roles: Role[];
  contact: Contact | null;
  about: About | null;
  locale: MainLocale;
  initialTheme?: string;
}

export function MainSidebar({ profile, roles, contact, about, locale, initialTheme = "system" }: MainSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("about");
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const isInitialRole = useRef(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    isInitialRole.current = false;
    setHasMounted(true);
  }, []);

  const isHomePage = pathname === `/${locale}` || pathname === "/";
  const otherLocale = locale === "en" ? "id" : "en";
  const switchLangPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const enPath = pathname.startsWith("/id") ? pathname.replace(/^\/id/, "/en") : (pathname === "/" ? "/en" : pathname);
  const idPath = pathname.startsWith("/en") ? pathname.replace(/^\/en/, "/id") : (pathname === "/" ? "/id" : pathname);

  // Cycle through roles every 3 seconds
  useEffect(() => {
    if (roles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  const currentRole =
    roles.length > 0
      ? locale === "id"
        ? roles[currentRoleIndex]?.role_id
        : roles[currentRoleIndex]?.role_en
      : "Full-Stack Developer";

  // Auto-scroll sidebar menu to keep active section/page in view with comfortable padding
  useEffect(() => {
    const container = menuContainerRef.current;
    if (!container) return;

    if (activeSection === "about" || (isHomePage && typeof window !== "undefined" && window.scrollY < 200)) {
      if (container.scrollTop > 0) {
        container.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
      return;
    }

    const activeEl = container.querySelector<HTMLElement>("[data-sidebar-active='true']");
    if (activeEl) {
      const elRect = activeEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const padding = 32;

      if (elRect.top - padding < containerRect.top) {
        const diff = containerRect.top - (elRect.top - padding);
        container.scrollTo({
          top: Math.max(0, container.scrollTop - diff),
          behavior: "smooth",
        });
      } else if (elRect.bottom + padding > containerRect.bottom) {
        const diff = (elRect.bottom + padding) - containerRect.bottom;
        container.scrollTo({
          top: container.scrollTop + diff,
          behavior: "smooth",
        });
      }
    }
  }, [activeSection, pathname, isHomePage]);

  // Track active section on Homepage scroll (instant real-time detection via requestAnimationFrame & getBoundingClientRect)
  useEffect(() => {
    if (!isHomePage) {
      setActiveSection("");
      return;
    }

    const sectionIds = [
      "about",
      "experiences",
      "projects",
      "achievements",
      "blogs",
      "contact",
    ];

    let ticking = false;

    const updateActiveSection = () => {
      const scrollY = window.scrollY;
      if (scrollY < 150) {
        setActiveSection((prev) => (prev !== "about" ? "about" : prev));
        return;
      }

      // If scrolled near bottom of page, activate last section
      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 60) {
        setActiveSection((prev) => (prev !== "contact" ? "contact" : prev));
        return;
      }

      const triggerLine = window.innerHeight * 0.35;
      let current = "about";

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerLine && rect.bottom > triggerLine) {
            current = id;
            break;
          }
        }
      }

      setActiveSection((prev) => (prev !== current ? current : prev));
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window !== "undefined" && window.scrollY > 150) {
      updateActiveSection();
    } else {
      timeoutId = setTimeout(updateActiveSection, 550);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isHomePage]);

  const clearScrollFlags = () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("scroll-target");
    sessionStorage.removeItem("scroll_to_hero");
    sessionStorage.removeItem("scroll_to_about");
    sessionStorage.removeItem("scroll_to_experiences");
    sessionStorage.removeItem("scroll_to_projects");
    sessionStorage.removeItem("scroll_to_achievements");
    sessionStorage.removeItem("scroll_to_blogs");
    sessionStorage.removeItem("scroll_to_contact");
  };

  const handleSectionClick = (id: string) => {
    if (isHomePage) {
      if (id === "about") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        menuContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      clearScrollFlags();
      sessionStorage.setItem("scroll-target", id);
      sessionStorage.setItem(`scroll_to_${id}`, "true");
      router.push(`/${locale}`, { scroll: false });
    }
  };


  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(tLinks(locale as any, "copied"), {
        description: tLinks(locale as any, "copied_desc"),
      });
      setShareDropdownOpen(false);
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
      setShareDropdownOpen(false);
    }
  };

  const handleSocialShare = (platform: "LinkedIn" | "WhatsApp" | "Threads") => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text =
      locale === "id"
        ? `Website & Portfolio Fadil Bafagih`
        : `Fadil Bafagih's Personal Website & Portfolio`;

    let shareUrl = "";
    if (platform === "LinkedIn") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    } else if (platform === "WhatsApp") {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`;
    } else if (platform === "Threads") {
      shareUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text}\n${url}`)}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
      setShareDropdownOpen(false);
    }
  };

  const shareChannels = [
    { name: "LinkedIn" as const, icon: LinkedInIcon, label: "LinkedIn" },
    { name: "WhatsApp" as const, icon: WhatsAppIcon, label: "WhatsApp" },
    { name: "Threads" as const, icon: ThreadsIcon, label: "Threads" },
  ];

  const sections = [
    { id: "about", label: tMain(locale, "nav_about"), icon: User, href: `/${locale}#about` },
    { id: "experiences", label: tMain(locale, "nav_experiences"), icon: Briefcase, href: `/${locale}#experiences` },
    { id: "projects", label: tMain(locale, "nav_projects"), icon: FolderGit2, href: `/${locale}#projects` },
    { id: "achievements", label: tMain(locale, "nav_achievements"), icon: Award, href: `/${locale}#achievements` },
    { id: "blogs", label: tMain(locale, "nav_blogs"), icon: BookOpen, href: `/${locale}#blogs` },
    { id: "contact", label: tMain(locale, "nav_contact"), icon: Mail, href: `/${locale}#contact` },
  ];

  const pages = [
    { id: "links", label: tMain(locale, "nav_links"), icon: Link2, href: `/${locale}/links`, isExternal: true },
    { id: "all_projects", label: tMain(locale, "nav_all_projects"), icon: FolderGit2, href: `/${locale}/projects`, isExternal: false },
    { id: "all_achievements", label: tMain(locale, "nav_all_achievements"), icon: Award, href: `/${locale}/achievements`, isExternal: false },
    { id: "all_blogs", label: tMain(locale, "nav_all_articles"), icon: BookOpen, href: `/${locale}/blogs`, isExternal: false },
  ];

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-[280px] shrink-0 h-screen sticky top-0 border-r border-neutral-200/60 dark:border-white/10 z-40 justify-between overflow-hidden bg-white dark:bg-neutral-950",
        hasMounted ? "animate-sidebar-in" : "opacity-0 -translate-x-4 pointer-events-none"
      )}
    >
      {/* 1. STICKY TOP: Profile Section (Vertical layout like links page) */}
      <div className="shrink-0 pt-6 pb-4 px-5 flex flex-col items-center text-center">
        {/* Avatar (Clickable to home / scrollToTop) */}
        {profile?.photo_url && (
          <Link
            href={`/${locale}`}
            onClick={(e) => {
              if (pathname === `/${locale}` || pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                menuContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="mb-3 cursor-pointer shrink-0 group block outline-none"
            aria-label="Home"
          >
            <div className="profile-photo-shimmer relative h-[88px] w-[88px] rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-900 shadow-xs transition-transform duration-200 group-hover:scale-[1.03] group-active:scale-[0.98]">
              <Image
                src={toStorageUrl(profile.photo_url)}
                alt={profile.full_name || "Profile"}
                fill
                className="object-cover select-none profile-image-grayscale"
                sizes="96px"
                priority
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
            </div>
          </Link>
        )}

        {/* Name + Verified Badge (True centered name, badge positioned absolutely on right) */}
        <div className="relative flex justify-center w-full">
          <div className="relative inline-flex items-center">
            <h2 className="text-lg xl:text-[20px] font-semibold tracking-tight text-neutral-900 dark:text-white truncate">
              {profile?.full_name || "Fadil Bafagih"}
            </h2>
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-1.5 flex items-center shrink-0">
              <VerifiedBadge />
            </span>
          </div>
        </div>

        {/* Role with cycling animation */}
        <div className="h-5 overflow-hidden mt-0.5 w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={currentRoleIndex}
              initial={isInitialRole.current ? false : { y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal truncate"
            >
              {currentRole}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Divider between Profile and Menu */}
      <div className="ml-5 h-px bg-neutral-200/60 dark:bg-white/10 my-0.5 shrink-0" />

      {/* 2. SCROLLABLE MIDDLE: Menu List ONLY (Single Scrollbar) */}
      <div
        ref={menuContainerRef}
        className="flex-1 overflow-y-auto scrollbar-custom min-h-0 py-3.5 px-5 flex flex-col gap-2.5"
      >
        {/* Sections list */}
        <div className="flex flex-col gap-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = isHomePage && activeSection === sec.id;

            return (
              <button
                key={sec.id}
                type="button"
                data-sidebar-active={isActive ? "true" : "false"}
                onClick={() => handleSectionClick(sec.id)}
                className="group relative flex items-center justify-between w-full h-10 px-3.5 rounded-xl text-sm font-normal cursor-pointer transition-colors duration-150"
              >
                {/* Smooth Animated Active Pill Background */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveSectionPill"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 34,
                      mass: 0.8,
                    }}
                    className="absolute inset-0 rounded-xl bg-neutral-900 dark:bg-white border border-neutral-900 dark:border-white shadow-xs z-0"
                  />
                )}

                {/* Non-active hover border */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-neutral-200 dark:group-hover:border-white/10 pointer-events-none transition-colors duration-150 z-0" />
                )}

                {/* Content */}
                <div className="relative z-10 flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive
                        ? "text-white dark:text-neutral-900"
                        : "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                      }`}
                  />
                  <span
                    className={`leading-5 truncate transition-colors duration-150 ${isActive
                        ? "text-white dark:text-neutral-900 font-medium"
                        : "text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white"
                      }`}
                  >
                    {sec.label}
                  </span>
                </div>

                <div className="relative z-10 flex items-center justify-end w-4 h-4 shrink-0">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -3 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ArrowRight className="h-4 w-4 text-white dark:text-neutral-900 shrink-0" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pages Section Header Label (PAGES / HALAMAN) */}
        <div className="px-3.5 pt-3 pb-1 flex items-center">
          <span className="text-[11px] font-normal uppercase tracking-wider text-neutral-400 dark:text-neutral-500 select-none">
            {tMain(locale, "nav_pages_header")}
          </span>
        </div>

        {/* Pages list */}
        <div className="flex flex-col gap-1">
          {pages.map((pg) => {
            const Icon = pg.icon;
            const isPageActive = pathname.startsWith(pg.href);

            return (
              <Link
                key={pg.id}
                href={pg.href}
                target={pg.isExternal ? "_blank" : undefined}
                rel={pg.isExternal ? "noopener noreferrer" : undefined}
                data-sidebar-active={isPageActive ? "true" : "false"}
                className="group relative flex items-center justify-between w-full h-10 px-3.5 rounded-xl text-sm font-normal cursor-pointer transition-colors duration-150"
              >
                {/* Smooth Animated Active Pill Background */}
                {isPageActive && (
                  <motion.div
                    layoutId="sidebarActivePagePill"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 34,
                      mass: 0.8,
                    }}
                    className="absolute inset-0 rounded-xl bg-neutral-900 dark:bg-white border border-neutral-900 dark:border-white shadow-xs z-0"
                  />
                )}

                {/* Non-active hover border */}
                {!isPageActive && (
                  <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-neutral-200 dark:group-hover:border-white/10 pointer-events-none transition-colors duration-150 z-0" />
                )}

                <div className="relative z-10 flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isPageActive
                        ? "text-white dark:text-neutral-900"
                        : "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                      }`}
                  />
                  <span
                    className={`leading-5 truncate transition-colors duration-150 ${isPageActive
                        ? "text-white dark:text-neutral-900 font-medium"
                        : "text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white"
                      }`}
                  >
                    {pg.label}
                  </span>
                </div>

                <div className="relative z-10 flex items-center justify-end w-4 h-4 shrink-0">
                  <AnimatePresence>
                    {isPageActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -3 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ArrowRight className="h-4 w-4 text-white dark:text-neutral-900 shrink-0" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Divider between Menu and Bottom Controls */}
      <div className="ml-5 h-px bg-neutral-200/60 dark:bg-white/10 my-0.5 shrink-0" />

      {/* 3. STICKY BOTTOM: Toggle, Language Switch, Subscribe, Copyright */}
      <div className="shrink-0 pt-4 pb-5 px-5 flex flex-col gap-3.5">

        {/* Theme 3-mode, Language Toggle Switch [EN | ID] & Share (full width) */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          <ThemeModeToggle locale={locale} initialTheme={initialTheme} className="flex-3 h-9" />

          {/* Language Toggle Switch [ EN | ID ] with Tooltip */}
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center p-1 rounded-lg border border-neutral-200 dark:border-white/10 bg-transparent h-9 flex-2 gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <Link
                    href={enPath}
                    prefetch={false}
                    onClick={(e) => {
                      if (locale === "en") e.preventDefault();
                      else trackEvent("language_switch", "en");
                    }}
                    className={`flex-1 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-200 select-none ${locale === "en"
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs cursor-default"
                        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                      }`}
                    aria-label="English"
                  >
                    EN
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>English</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <Link
                    href={idPath}
                    prefetch={false}
                    onClick={(e) => {
                      if (locale === "id") e.preventDefault();
                      else trackEvent("language_switch", "id");
                    }}
                    className={`flex-1 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-200 select-none ${locale === "id"
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs cursor-default"
                        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                      }`}
                    aria-label="Bahasa Indonesia"
                  >
                    ID
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>Bahasa Indonesia</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Share Button & Dropdown */}
            <Tooltip open={shareDropdownOpen ? false : undefined}>
              <DropdownMenu open={shareDropdownOpen} onOpenChange={setShareDropdownOpen}>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onClick={() => trackEvent("share_click", "sidebar")}
                      className="h-9 w-9 shrink-0 rounded-lg border border-neutral-200 dark:border-white/10 relative cursor-pointer flex items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors outline-none"
                      aria-label={tMain(locale, "share")}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  sideOffset={8}
                  collisionPadding={16}
                  className="w-[210px] p-2.5"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuLabel className="text-xs font-semibold px-0 pt-0.5 pb-2 text-neutral-500 dark:text-neutral-400">
                    {tLinks(locale as any, "share_links")}
                  </DropdownMenuLabel>
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
              <TooltipContent side="top">
                <p>{tMain(locale, "share")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Inset Divider between Controls and Copyright (touches right border) */}
        <div className="-mr-5 border-t border-neutral-200/60 dark:border-white/10 shrink-0" />

        {/* Copyright & Bafdev with Animated Underline */}
        <div className="flex flex-col items-center justify-center text-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500 w-full">
          <p>© {new Date().getFullYear()} Fadil Bafagih. {tMain(locale, "all_rights")}</p>
          <p>
            {tMain(locale, "build_with")}{" "}
            <a
              href="https://bafdev.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-neutral-900 dark:text-white transition-colors relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-neutral-900 dark:after:bg-white after:transition-all after:duration-300 hover:after:w-full cursor-pointer"
            >
              Bafdev
            </a>
          </p>
        </div>

      </div>
    </aside>
  );
}
