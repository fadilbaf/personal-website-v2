"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  X,
  Share2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AnimatedHamburger } from "@/components/ui/animated-hamburger";
import { ThemeModeToggle } from "@/src/components/main/theme-mode-toggle";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import { tLinks } from "@/src/lib/links-translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScrollLock, forceUnlockScroll } from "@/src/app/lib/use-scroll-lock";
import { trackEvent } from "@/src/lib/track-event";

import logoBlack from "@/src/assets/images/fadilbaf-black.svg";
import logoWhite from "@/src/assets/images/fadilbaf-white.svg";

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

interface MainMobileHeaderProps {
  locale: MainLocale;
}

export function MainMobileHeader({ locale }: MainMobileHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);

  const isHomePage = pathname === `/${locale}` || pathname === "/";
  const otherLocale = locale === "en" ? "id" : "en";
  const switchLangPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  // Lock body scroll when overlay is open
  useScrollLock(menuOpen);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && e.isTrusted && menuOpen) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

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
    forceUnlockScroll();
    setMenuOpen(false);

    if (isHomePage) {
      if (id === "about") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("scroll-target");
        sessionStorage.removeItem("scroll_to_hero");
        sessionStorage.removeItem("scroll_to_about");
        sessionStorage.removeItem("scroll_to_experiences");
        sessionStorage.removeItem("scroll_to_projects");
        sessionStorage.removeItem("scroll_to_achievements");
        sessionStorage.removeItem("scroll_to_blogs");
        sessionStorage.removeItem("scroll_to_contact");
      }
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
    <>
      {/* Top Bar on Mobile */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between px-4 sm:px-10 md:px-16 bg-white/70 backdrop-blur-xl border-b border-neutral-200/60 dark:bg-neutral-950/70 dark:border-white/10">
        <Link
          href={`/${locale}`}
          onClick={(e) => {
            if (pathname === `/${locale}` || pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="relative flex items-center h-7 cursor-pointer outline-none"
        >
          <img
            src={logoBlack.src}
            alt="Fadil Bafagih"
            className="dark:hidden h-7 w-auto"
          />
          <img
            src={logoWhite.src}
            alt="Fadil Bafagih"
            className="hidden dark:block h-7 w-auto"
          />
        </Link>

        <AnimatedHamburger
          active={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={tMain(locale, "menu")}
        />
      </header>

      {/* Mobile Drawer / Overlay Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white lg:hidden"
          >
            {/* Header with Logo + Close (X) button */}
            <div className="flex h-14 items-center justify-between px-4 sm:px-6 border-b border-neutral-200/60 dark:border-white/10 shrink-0">
              <Link
                href={`/${locale}`}
                onClick={() => {
                  setMenuOpen(false);
                  if (pathname === `/${locale}` || pathname === "/") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="relative flex items-center h-7 cursor-pointer outline-none"
              >
                <img
                  src={logoBlack.src}
                  alt="Fadil Bafagih"
                  className="dark:hidden h-7 w-auto"
                />
                <img
                  src={logoWhite.src}
                  alt="Fadil Bafagih"
                  className="hidden dark:block h-7 w-auto"
                />
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                aria-label={tMain(locale, "close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-custom p-4 sm:p-6 flex flex-col justify-between gap-6">
              
              {/* Menu Sections & Pages */}
              <div className="flex flex-col gap-4">
                
                {/* Sections List */}
                <div className="flex flex-col gap-1.5">
                  {sections.map((sec) => {
                    const Icon = sec.icon;
                    const isActive = isHomePage && activeSection === sec.id;

                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => handleSectionClick(sec.id)}
                        className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs"
                            : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-transparent hover:border-neutral-200 dark:hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon
                            className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              isActive
                                ? "text-white dark:text-neutral-900"
                                : "text-neutral-400 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                            }`}
                          />
                          <span className="leading-none">{sec.label}</span>
                        </div>
                        {isActive ? (
                          <ArrowRight className="h-4 w-4 text-white dark:text-neutral-900" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-neutral-200/60 dark:bg-white/10" />

                {/* Pages List */}
                <div className="flex flex-col gap-1.5">
                  {pages.map((pg) => {
                    const Icon = pg.icon;
                    const isPageActive = pathname.startsWith(pg.href);

                    return (
                      <Link
                        key={pg.id}
                        href={pg.href}
                        target={pg.isExternal ? "_blank" : undefined}
                        rel={pg.isExternal ? "noopener noreferrer" : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                          isPageActive
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs"
                            : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-transparent hover:border-neutral-200 dark:hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon
                            className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              isPageActive
                                ? "text-white dark:text-neutral-900"
                                : "text-neutral-400 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                            }`}
                          />
                          <span className="leading-none">{pg.label}</span>
                        </div>
                        {isPageActive ? (
                          <ArrowRight className="h-4 w-4 text-white dark:text-neutral-900" />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>

              </div>

              {/* Bottom: Theme, Lang, Newsletter, Copyright */}
              <div className="flex flex-col gap-4 pt-4 border-t border-neutral-200/60 dark:border-white/10">
                
                {/* Controls: Theme toggle (3-mode) + Language switch + Share */}
                <div className="flex items-center justify-between gap-2">
                  <ThemeModeToggle locale={locale} />

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-white/10 relative cursor-pointer flex items-center justify-center"
                      aria-label={tMain(locale, "switch_lang")}
                    >
                      <Link
                        href={switchLangPath}
                        prefetch={false}
                        onClick={() => {
                          setMenuOpen(false);
                          trackEvent("language_switch", otherLocale);
                        }}
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

                    {/* Share Button & Dropdown on Mobile */}
                    <DropdownMenu open={shareDropdownOpen} onOpenChange={setShareDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          onClick={() => trackEvent("share_click", "mobile_header")}
                          className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-white/10 relative cursor-pointer flex items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors outline-none"
                          aria-label={tMain(locale, "share")}
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>

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
                  </div>
                </div>

                {/* Newsletter section */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {tMain(locale, "newsletter_desc")}
                  </p>
                  <form onSubmit={handleSubscribe} className="w-full" noValidate>
                    <div className="flex h-11 items-center justify-between border border-neutral-200 dark:border-white/10 rounded-lg p-1 bg-transparent w-full focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-all">
                      <div className="flex h-full items-center gap-2.5 pl-2.5 flex-1 min-w-0">
                        <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={tMain(locale, "enter_email")}
                          className="w-full h-full bg-transparent border-none p-0 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white dark:placeholder:text-neutral-500 transition-all"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="h-full rounded-md bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 whitespace-nowrap cursor-pointer transition-colors duration-200 inline-flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{tMain(locale, "subscribing")}</span>
                          </>
                        ) : (
                          <span>{tMain(locale, "subscribe")}</span>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Copyright & Bafdev */}
                <div className="flex flex-col items-center sm:items-start gap-1 text-xs text-neutral-400 dark:text-neutral-500 text-center sm:text-left">
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

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
