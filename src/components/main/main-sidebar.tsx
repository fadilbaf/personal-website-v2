"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  User,
  Briefcase,
  FolderGit2,
  Award,
  BookOpen,
  Mail,
  Link2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Profile, Role, Contact, About } from "@/src/types/database";
import { toStorageUrl } from "@/src/lib/storage-url";
import { ThemeModeToggle } from "@/src/components/main/theme-mode-toggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trackEvent } from "@/src/lib/track-event";

/** Verified badge (blue checkmark) — identical to main-about.tsx */
function VerifiedBadge() {
  return (
    <svg className="h-5 w-5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5a.749.749 0 01-1.041.208l-.115-.094-2.415-2.415a.75.75 0 111.06-1.06l1.77 1.767 3.825-5.74a.75.75 0 011.25.833z" />
    </svg>
  );
}

interface MainSidebarProps {
  profile: Profile | null;
  roles: Role[];
  contact: Contact | null;
  about: About | null;
  locale: MainLocale;
}

export function MainSidebar({ profile, roles, contact, locale }: MainSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isHomePage = pathname === `/${locale}` || pathname === "/";
  const otherLocale = locale === "en" ? "id" : "en";
  const switchLangPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

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
      : "QA Engineer";

  // Track active section on Homepage scroll
  useEffect(() => {
    if (!isHomePage) {
      setActiveSection("");
      return;
    }

    const sectionIds = [
      "hero",
      "about",
      "experiences",
      "projects",
      "achievements",
      "blogs",
      "contact",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      let current = "hero";

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = id;
            break;
          }
        }
      }

      if (window.scrollY < 200) {
        current = "hero";
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const handleSectionClick = (id: string) => {
    if (isHomePage) {
      if (id === "hero") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      sessionStorage.setItem("scroll-target", id);
      sessionStorage.setItem(`scroll_to_${id}`, "true");
      router.push(`/${locale}`, { scroll: false });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error(tMain(locale, "newsletter_required"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error(tMain(locale, "newsletter_error"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          locale,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || tMain(locale, "newsletter_success"));
        setEmail("");
      } else {
        toast.error(result.error || tMain(locale, "newsletter_error"));
      }
    } catch {
      toast.error(tMain(locale, "newsletter_error"));
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "hero", label: tMain(locale, "nav_home"), icon: Home, href: `/${locale}#hero` },
    { id: "about", label: tMain(locale, "nav_about"), icon: User, href: `/${locale}#about` },
    { id: "experiences", label: tMain(locale, "nav_experiences"), icon: Briefcase, href: `/${locale}#experiences` },
    { id: "projects", label: tMain(locale, "nav_projects"), icon: FolderGit2, href: `/${locale}#projects` },
    { id: "achievements", label: tMain(locale, "nav_achievements"), icon: Award, href: `/${locale}#achievements` },
    { id: "blogs", label: tMain(locale, "nav_blogs"), icon: BookOpen, href: `/${locale}#blogs` },
    { id: "contact", label: tMain(locale, "nav_contact"), icon: Mail, href: `/${locale}#contact` },
  ];

  const pages = [
    { id: "links", label: tMain(locale, "nav_links"), icon: Link2, href: `/${locale}/links`, isExternal: false },
    { id: "all_projects", label: tMain(locale, "nav_all_projects"), icon: FolderGit2, href: `/${locale}/projects`, isExternal: false },
    { id: "all_achievements", label: tMain(locale, "nav_all_achievements"), icon: Award, href: `/${locale}/achievements`, isExternal: false },
    { id: "all_blogs", label: tMain(locale, "nav_all_articles"), icon: BookOpen, href: `/${locale}/blogs`, isExternal: false },
  ];

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="hidden lg:flex flex-col w-[300px] xl:w-[320px] shrink-0 h-screen sticky top-0 border-r border-neutral-200/60 dark:border-white/10 z-40 justify-between overflow-hidden bg-white/70 dark:bg-neutral-950/70 backdrop-blur-xl"
    >
      {/* 1. STICKY TOP: Profile Section */}
      <div className="shrink-0 pt-6 pb-5 px-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar (enlarged & balanced with text) */}
          {profile?.photo_url && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 1.03 }}
              className="cursor-pointer shrink-0"
            >
              <div className="profile-photo-shimmer relative h-[84px] w-[84px] xl:h-[88px] xl:w-[88px] rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-900 shadow-xs">
                {isImageLoading && (
                  <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse z-10" />
                )}
                <Image
                  src={toStorageUrl(profile.photo_url)}
                  alt={profile.full_name || "Profile"}
                  fill
                  className="object-cover select-none profile-image-grayscale"
                  sizes="90px"
                  priority
                  onLoad={() => setIsImageLoading(false)}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
              </div>
            </motion.div>
          )}

          {/* Name & Role */}
          <div className="flex flex-col min-w-0 flex-1 justify-center">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg xl:text-[21px] font-bold tracking-tight text-neutral-900 dark:text-white truncate">
                {profile?.full_name || "Fadil Bafagih"}
              </h2>
              <VerifiedBadge />
            </div>

            <div className="h-5 overflow-hidden mt-0.5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentRoleIndex}
                  initial={{ y: 10, opacity: 0 }}
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
        </div>
      </div>

      {/* Full-width Divider between Profile and Menu (touches sidebar border) */}
      <div className="w-full h-px bg-neutral-200/60 dark:bg-white/10 shrink-0" />

      {/* 2. SCROLLABLE MIDDLE: Menu List ONLY (Single Scrollbar) */}
      <div className="flex-1 overflow-y-auto scrollbar-custom min-h-0 py-3.5 px-5 flex flex-col gap-3">
        {/* Sections list */}
        <div className="flex flex-col gap-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = isHomePage && activeSection === sec.id;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleSectionClick(sec.id)}
                className={`group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-transparent hover:border-neutral-200 dark:hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? "text-white dark:text-neutral-900"
                        : "text-neutral-400 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                    }`}
                  />
                  <span className="leading-none">{sec.label}</span>
                </div>
                {isActive ? (
                  <ArrowRight className="h-4 w-4 text-white dark:text-neutral-900 transition-transform duration-200" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Full-width Divider between Sections and Pages inside the single scrollable container */}
        <div className="-mx-5 h-px bg-neutral-200/60 dark:bg-white/10 my-1" />

        {/* Pages list */}
        <div className="flex flex-col gap-1">
          {pages.map((pg) => {
            const Icon = pg.icon;
            const isPageActive = pathname.startsWith(pg.href);

            return (
              <Link
                key={pg.id}
                href={pg.href}
                className={`group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isPageActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-transparent hover:border-neutral-200 dark:hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isPageActive
                        ? "text-white dark:text-neutral-900"
                        : "text-neutral-400 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                    }`}
                  />
                  <span className="leading-none">{pg.label}</span>
                </div>
                {isPageActive ? (
                  <ArrowRight className="h-4 w-4 text-white dark:text-neutral-900 transition-transform duration-200" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Full-width Divider between Menu and Bottom Controls (touches sidebar border) */}
      <div className="w-full h-px bg-neutral-200/60 dark:bg-white/10 shrink-0" />

      {/* 3. STICKY BOTTOM: Toggle, Language Switch, Subscribe, Copyright */}
      <div className="shrink-0 pt-4 pb-5 px-5 flex flex-col gap-3.5">
        
        {/* Theme 3-mode & Language Switch (grouped to the left) */}
        <div className="flex items-center gap-2 justify-start w-full">
          <ThemeModeToggle locale={locale} />

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-white/10 relative cursor-pointer flex items-center justify-center"
                  aria-label={tMain(locale, "switch_lang")}
                  onClick={(e) => e.currentTarget.blur()}
                >
                  <Link
                    href={switchLangPath}
                    prefetch={false}
                    onClick={() => trackEvent("language_switch", otherLocale)}
                  >
                    <svg
                      className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                      <path d="M2 12h20" />
                    </svg>
                    <span className="absolute -bottom-1.5 -right-1.5 z-0 flex h-4 min-w-[16px] items-center justify-center rounded-[4px] bg-neutral-900 px-0.5 text-[8px] font-bold text-white border border-neutral-200 dark:bg-white dark:text-neutral-900 dark:border-neutral-800 leading-none select-none uppercase">
                      {otherLocale}
                    </span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{tMain(locale, "switch_lang")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Subscribe Form (Exact focus & button styles from main-footer.tsx) */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {tMain(locale, "newsletter_desc")}
          </p>
          <form onSubmit={handleSubscribe} className="w-full" noValidate>
            <div className="flex h-10 items-center justify-between border border-neutral-200 dark:border-white/10 rounded-lg p-1 bg-transparent w-full focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-all">
              <div className="flex h-full items-center gap-2 pl-2 flex-1 min-w-0">
                <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tMain(locale, "enter_email")}
                  className="w-full h-full bg-transparent border-none p-0 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white dark:placeholder:text-neutral-500 transition-all"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-full rounded-md bg-neutral-900 px-3 text-xs font-semibold text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 whitespace-nowrap cursor-pointer transition-colors duration-200 inline-flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{tMain(locale, "subscribing")}</span>
                  </>
                ) : (
                  <span>{tMain(locale, "subscribe")}</span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Full-width Divider between Subscribe and Copyright */}
        <div className="-mx-5 h-px bg-neutral-200/60 dark:bg-white/10" />

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
    </motion.aside>
  );
}
