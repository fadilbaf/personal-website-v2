"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Briefcase,
  FolderGit2,
  Award,
  BookOpen,
  Mail,
  Home,
  Link2,
  ArrowUpRight,
} from "lucide-react";
import { tMain, type MainLocale } from "@/src/lib/main-translations";

interface NavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  locale: MainLocale;
  hireMeEmail?: string | null;
}

export function NavMenu({ isOpen, onClose, locale, hireMeEmail }: NavMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const isHomePage = pathname === `/${locale}` || pathname === "/";

  // Lock body and html scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Track active section on Homepage scroll
  useEffect(() => {
    if (!isHomePage) {
      setActiveSection(null);
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

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      let currentSection = "";

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSection = id;
            break;
          }
        }
      }

      setActiveSection(currentSection || null);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const handleSectionClick = (id: string) => {
    // Unlock body/html scroll immediately
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    onClose();

    if (isHomePage) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      sessionStorage.setItem("scroll-target", id);
      sessionStorage.setItem(`scroll_to_${id}`, "true");
      router.push(`/${locale}`, { scroll: false });
    }
  };

  const sections = [
    { id: "about", label: tMain(locale, "nav_about"), icon: User, href: `/${locale}#about` },
    { id: "experiences", label: tMain(locale, "nav_experiences"), icon: Briefcase, href: `/${locale}#experiences` },
    { id: "projects", label: tMain(locale, "nav_projects"), icon: FolderGit2, href: `/${locale}#projects` },
    { id: "achievements", label: tMain(locale, "nav_achievements"), icon: Award, href: `/${locale}#achievements` },
    { id: "blogs", label: tMain(locale, "nav_blogs"), icon: BookOpen, href: `/${locale}#blogs` },
    { id: "contact", label: tMain(locale, "nav_contact"), icon: Mail, href: `/${locale}#contact` },
  ];

  const pages = [
    { id: "home", label: tMain(locale, "nav_home"), icon: Home, href: `/${locale}`, isExternal: false },
    { id: "projects", label: tMain(locale, "nav_all_projects"), icon: FolderGit2, href: `/${locale}/projects`, isExternal: false },
    { id: "achievements", label: tMain(locale, "nav_all_achievements"), icon: Award, href: `/${locale}/achievements`, isExternal: false },
    { id: "blogs", label: tMain(locale, "nav_all_articles"), icon: BookOpen, href: `/${locale}/blogs`, isExternal: false },
    { id: "links", label: tMain(locale, "nav_links"), icon: Link2, href: `/${locale}/links`, isExternal: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-nav-menu="open"
          data-state="open"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed inset-0 z-40 flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white pt-14"
        >
          {/* Scrollable Navigation Body */}
          <div className="flex-1 overflow-y-auto scrollbar-custom overscroll-contain px-3.5 sm:px-12 md:px-24 lg:px-36 py-6 sm:py-8">
            <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6 sm:gap-8">
              {/* 1. SECTIONS */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-normal uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-0">
                  {tMain(locale, "nav_sections_header")}
                </h3>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = isHomePage && activeSection === section.id;

                    return (
                      <Link
                        key={section.id}
                        href={section.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSectionClick(section.id);
                        }}
                        className={`group flex items-center justify-between w-full px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs"
                            : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-transparent hover:border-neutral-200 active:border-neutral-200 dark:hover:border-white/10 dark:active:border-white/10 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 sm:gap-4">
                          <Icon
                            className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              isActive
                                ? "text-white dark:text-neutral-900"
                                : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                            }`}
                          />
                          <span className={`text-base sm:text-lg tracking-tight leading-none ${isActive ? "font-semibold" : "font-medium"}`}>
                            {section.label}
                          </span>
                        </div>
                        <ArrowUpRight
                          className={`h-5 w-5 sm:h-5.5 sm:w-5.5 transition-transform duration-200 ${
                            isActive
                              ? "text-white dark:text-neutral-900"
                              : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 group-active:translate-x-1 group-active:-translate-y-1"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Divider Line */}
              <div className="w-full h-px bg-neutral-200/60 dark:bg-white/10" />

              {/* 2. PAGES */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-normal uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-0">
                  {tMain(locale, "nav_pages_header")}
                </h3>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  {pages.map((page) => {
                    const Icon = page.icon;
                    const isPageActive =
                      page.id === "home"
                        ? isHomePage && !activeSection
                        : pathname.startsWith(page.href);

                    if (page.isExternal) {
                      return (
                        <a
                          key={page.id}
                          href={page.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={onClose}
                          className={`group flex items-center justify-between w-full px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl transition-all duration-200 cursor-pointer ${
                            isPageActive
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs"
                              : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-transparent hover:border-neutral-200 active:border-neutral-200 dark:hover:border-white/10 dark:active:border-white/10 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-3.5 sm:gap-4">
                            <Icon
                              className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                isPageActive
                                  ? "text-white dark:text-neutral-900"
                                  : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                              }`}
                            />
                            <span className={`text-base sm:text-lg tracking-tight leading-none ${isPageActive ? "font-semibold" : "font-medium"}`}>
                              {page.label}
                            </span>
                          </div>
                          <ArrowUpRight
                            className={`h-5 w-5 sm:h-5.5 sm:w-5.5 transition-transform duration-200 ${
                              isPageActive
                                ? "text-white dark:text-neutral-900"
                                : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 group-active:translate-x-1 group-active:-translate-y-1"
                            }`}
                          />
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={page.id}
                        href={page.href}
                        onClick={() => {
                          onClose();
                          if (page.id === "home" && isHomePage) {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }}
                        className={`group flex items-center justify-between w-full px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl transition-all duration-200 cursor-pointer ${
                          isPageActive
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs"
                            : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-transparent hover:border-neutral-200 active:border-neutral-200 dark:hover:border-white/10 dark:active:border-white/10 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 sm:gap-4">
                          <Icon
                            className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              isPageActive
                                ? "text-white dark:text-neutral-900"
                                : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                            }`}
                          />
                          <span className={`text-base sm:text-lg tracking-tight leading-none ${isPageActive ? "font-semibold" : "font-medium"}`}>
                            {page.label}
                          </span>
                        </div>
                        <ArrowUpRight
                          className={`h-5 w-5 sm:h-5.5 sm:w-5.5 transition-transform duration-200 ${
                            isPageActive
                              ? "text-white dark:text-neutral-900"
                              : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 group-active:translate-x-1 group-active:-translate-y-1"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Area (Mobile Hire Me + Footer) with Dividers */}
          <div className="shrink-0 border-t border-neutral-200/60 dark:border-white/10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md">
            {/* Mobile Sticky Hire Me Button */}
            {hireMeEmail && (
              <div className="sm:hidden w-full px-3.5 pt-3.5 pb-3">
                <a
                  href={`mailto:${hireMeEmail}`}
                  className="w-full h-11 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Mail className="h-4 w-4" />
                  {tMain(locale, "hire_me")}
                </a>
              </div>
            )}

            {/* Divider between Hire Me and Copyright (Mobile only) */}
            {hireMeEmail && (
              <div className="sm:hidden w-full h-px bg-neutral-200/60 dark:bg-white/10" />
            )}

            {/* Footer Row */}
            <div className="w-full px-3.5 sm:px-12 md:px-24 lg:px-36 py-3.5 sm:py-4">
              <div className="w-full max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4">
                <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center sm:text-left">
                  © {new Date().getFullYear()} Fadil Bafagih. {tMain(locale, "all_rights")}
                </p>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 text-center sm:text-right">
                  {tMain(locale, "build_with")}{" "}
                  <a
                    href="https://bafdev.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block align-baseline relative font-bold text-neutral-900 dark:text-white transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"
                  >
                    Bafdev
                  </a>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
