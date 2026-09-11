"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/app/lib/utils";
import { tLinks, type LinksLocale } from "@/src/lib/links-translations";
import type { Contact } from "@/src/types/database";
import { trackEvent } from "@/src/lib/track-event";
import { toggleThemeWithTransition } from "@/src/app/lib/theme-transition";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import logoBlack from "@/src/assets/images/fadilbaf-black.svg";
import logoWhite from "@/src/assets/images/fadilbaf-white.svg";

/** Inline SVG brand icons for share dropdown */
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

interface LinksHeaderProps {
  locale: LinksLocale;
  contact: Contact | null;
}

/**
 * Header for the /links page.
 * Mirrors dashboard mobile header style with logo, language switch, theme toggle, and share dropdown.
 */
export function LinksHeader({ locale, contact }: LinksHeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Wait for client-side mount to avoid hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const otherLocale = locale === "en" ? "id" : "en";

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(tLinks(locale, "copied"), {
        description: tLinks(locale, "copied_desc"),
      });
      setDropdownOpen(false);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success(tLinks(locale, "copied"), {
        description: tLinks(locale, "copied_desc"),
      });
      setDropdownOpen(false);
    }
  };

  const handleSocialShare = (platform: "LinkedIn" | "WhatsApp" | "Threads") => {
    const url = window.location.href;
    const text =
      locale === "id"
        ? "Tautan & Profil Resmi Fadil Bafagih"
        : "Official Links & Profile of Fadil Bafagih";

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
      setDropdownOpen(false);
    }
  };

  const shareChannels = [
    { name: "LinkedIn" as const, icon: LinkedInIcon, label: "LinkedIn" },
    { name: "WhatsApp" as const, icon: WhatsAppIcon, label: "WhatsApp" },
    { name: "Threads" as const, icon: ThreadsIcon, label: "Threads" },
  ];

  return (
    <TooltipProvider>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-30 flex h-14 items-center justify-between px-3.5 bg-white/70 backdrop-blur-xl border-b border-neutral-200/60 dark:bg-neutral-950/70 dark:border-white/10"
      >
        {/* Logo */}
        <Link
          href={`/${locale}/links`}
          prefetch={false}
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
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
          {/* 1. Language switch */}
          <Tooltip>
            <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-white/10 relative cursor-pointer flex items-center justify-center"
                aria-label={tLinks(locale, "switch_lang")}
                onClick={(e) => {
                  e.currentTarget.blur();
                }}
              >
                <Link 
                  href={`/${otherLocale}/links`} 
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
                  {/* Badge */}
                  <span className="absolute -bottom-1.5 -right-1.5 z-0 flex h-4 min-w-[16px] items-center justify-center rounded-[4px] bg-neutral-900 px-0.5 text-[8px] font-bold text-white border border-neutral-200 dark:bg-white dark:text-neutral-900 dark:border-neutral-800 leading-none select-none uppercase">
                    {otherLocale}
                  </span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{tLinks(locale, "switch_lang")}</p>
            </TooltipContent>
          </Tooltip>

          {/* 2. Theme toggle */}
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
                  aria-label={tLinks(locale, resolvedTheme === "dark" ? "theme_light" : "theme_dark")}
                >
                  <Moon className="h-4 w-4 text-neutral-600 dark:text-neutral-400 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Sun className="absolute h-4 w-4 text-neutral-600 dark:text-neutral-400 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{tLinks(locale, resolvedTheme === "dark" ? "theme_light" : "theme_dark")}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* 3. Share button (as DropdownMenu) */}
          <Tooltip open={dropdownOpen ? false : undefined}>
            <DropdownMenu onOpenChange={setDropdownOpen} open={dropdownOpen}>
              <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-white/10 cursor-pointer text-neutral-600 dark:text-neutral-400 relative flex items-center justify-center"
                    aria-label={tLinks(locale, "share")}
                    onClick={(e) => {
                      e.currentTarget.blur();
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[210px] p-2.5"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuLabel className="text-xs font-semibold px-0 pt-0.5 pb-2 text-neutral-500 dark:text-neutral-400">
                  {tLinks(locale, "share_links")}
                </DropdownMenuLabel>

                {/* Social Share Grid (LinkedIn, WhatsApp, Threads) */}
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

                {/* Copy Link Button (using Copy icon) */}
                <button
                  onClick={handleCopyUrl}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 transition-all hover:bg-neutral-100 active:bg-neutral-100 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:active:bg-neutral-700 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {tLinks(locale, "copy_url")}
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent side="bottom">
              <p>{tLinks(locale, "share")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.header>
    </TooltipProvider>
  );
}
