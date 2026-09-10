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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.101-.477-.15-.678.15-.201.3-.778.98-.954 1.18-.176.2-.352.226-.653.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.352.452-.528.15-.176.201-.301.301-.502.101-.201.05-.377-.025-.528-.075-.15-.678-1.633-.929-2.238-.244-.589-.493-.509-.678-.519l-.578-.01c-.201 0-.528.075-.804.377s-1.055 1.03-1.055 2.512 1.08 2.914 1.231 3.115c.151.201 2.126 3.246 5.15 4.553.719.311 1.281.497 1.719.636.723.23 1.381.197 1.902.12.58-.087 1.782-.728 2.033-1.431.251-.703.251-1.306.176-1.431-.075-.126-.276-.201-.577-.352zm-5.467 7.618a9.98 9.98 0 01-5.1-1.393l-.366-.217-3.791.995 1.013-3.696-.238-.379a9.97 9.97 0 01-1.533-5.31c0-5.523 4.492-10.015 10.015-10.015 2.676 0 5.19 1.042 7.081 2.934a9.96 9.96 0 012.934 7.081c0 5.524-4.492 10.015-10.015 10.015zm8.535-18.55A12.01 12.01 0 0012.005 0C5.38 0 .005 5.375.005 12c0 2.115.553 4.181 1.604 6.002L0 24l6.177-1.62a11.96 11.96 0 005.828 1.62c6.625 0 12-5.375 12-12 0-3.206-1.248-6.22-3.513-8.485z" />
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

  const handleSocialShare = (platform: "X" | "Facebook" | "LinkedIn" | "WhatsApp") => {
    const url = window.location.href;
    const text =
      locale === "id"
        ? "Tautan & Profil Resmi Fadil Bafagih"
        : "Official Links & Profile of Fadil Bafagih";

    let shareUrl = "";
    if (platform === "X") {
      shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else if (platform === "Facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    } else if (platform === "LinkedIn") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    } else if (platform === "WhatsApp") {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`;
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
    { name: "WhatsApp" as const, icon: WhatsAppIcon, label: "WhatsApp" },
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
                className="w-[220px] p-2.5"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuLabel className="text-xs font-semibold px-0 pt-0.5 pb-2 text-neutral-500 dark:text-neutral-400">
                  {tLinks(locale, "share_links")}
                </DropdownMenuLabel>

                {/* Social Share Grid (X, Facebook, LinkedIn, WhatsApp) */}
                <div className="grid grid-cols-4 gap-1.5 mb-2">
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
