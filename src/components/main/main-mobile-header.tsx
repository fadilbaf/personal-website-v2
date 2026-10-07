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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AnimatedHamburger } from "@/components/ui/animated-hamburger";
import { ThemeModeToggle } from "@/src/components/main/theme-mode-toggle";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import { useScrollLock, forceUnlockScroll } from "@/src/app/lib/use-scroll-lock";
import { trackEvent } from "@/src/lib/track-event";

import logoBlack from "@/src/assets/images/fadilbaf-black.svg";
import logoWhite from "@/src/assets/images/fadilbaf-white.svg";

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
                
                {/* Controls: Theme toggle (3-mode) + Language switch */}
                <div className="flex items-center justify-between gap-2">
                  <ThemeModeToggle locale={locale} />

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
