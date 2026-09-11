"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedHamburger } from "@/components/ui/animated-hamburger";
import { NavMenu } from "@/src/components/main/nav-menu";
import { trackEvent } from "@/src/lib/track-event";
import { toggleThemeWithTransition } from "@/src/app/lib/theme-transition";

import logoBlack from "@/src/assets/images/fadilbaf-black.svg";
import logoWhite from "@/src/assets/images/fadilbaf-white.svg";

interface MainHeaderProps {
  locale: MainLocale;
  hireMeEmail: string | null;
}

export function MainHeader({ locale, hireMeEmail }: MainHeaderProps) {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const otherLocale = locale === "en" ? "id" : "en";
  const switchLangPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <TooltipProvider>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 flex h-14 items-center bg-white/70 backdrop-blur-xl border-b border-neutral-200/60 dark:bg-neutral-950/70 dark:border-white/10 pl-3.5 sm:pl-12 md:pl-24 lg:pl-36 pr-[calc(0.875rem+var(--removed-body-scroll-bar-size,0px))] sm:pr-[calc(3rem+var(--removed-body-scroll-bar-size,0px))] md:pr-[calc(6rem+var(--removed-body-scroll-bar-size,0px))] lg:pr-[calc(9rem+var(--removed-body-scroll-bar-size,0px))]"
      >
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Logo */}
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

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language switch */}
            <Tooltip>
              <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-white/10 relative cursor-pointer flex items-center justify-center"
                  aria-label={tMain(locale, "switch_lang")}
                  onClick={(e) => {
                    e.currentTarget.blur();
                  }}
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
              <TooltipContent side="bottom">
                <p>{tMain(locale, "switch_lang")}</p>
              </TooltipContent>
            </Tooltip>

            {/* Theme toggle */}
            {mounted && (
              <Tooltip>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      toggleThemeWithTransition(resolvedTheme, setTheme, e);
                      e.currentTarget.blur();
                    }}
                    className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-white/10 cursor-pointer relative flex items-center justify-center"
                    aria-label={tMain(locale, resolvedTheme === "dark" ? "theme_light" : "theme_dark")}
                  >
                    <Moon className="h-4 w-4 text-neutral-600 dark:text-neutral-400 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Sun className="absolute h-4 w-4 text-neutral-600 dark:text-neutral-400 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tMain(locale, resolvedTheme === "dark" ? "theme_light" : "theme_dark")}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Hire Me Button */}
            {hireMeEmail && (
              <Tooltip>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <Button
                    asChild
                    onClick={(e) => {
                      e.currentTarget.blur();
                    }}
                    className="h-9 rounded-lg px-4 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-medium text-sm hidden sm:flex cursor-pointer border-0 shadow-none gap-1.5"
                  >
                    <a href={`mailto:${hireMeEmail}`}>
                      <Mail className="h-4 w-4" />
                      {tMain(locale, "hire_me")}
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tMain(locale, "hire_me")}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Hamburger Menu */}
            <Tooltip>
              <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                <AnimatedHamburger
                  active={menuOpen}
                  onClick={(e) => {
                    setMenuOpen(!menuOpen);
                    e.currentTarget.blur();
                  }}
                  aria-label={tMain(locale, "menu")}
                />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{tMain(locale, "menu")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </motion.header>

      {/* Nav Menu Overlay */}
      <NavMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        locale={locale}
        hireMeEmail={hireMeEmail}
      />
    </TooltipProvider>
  );
}
