"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  ExternalLink,
  Moon,
  Sun,
  Eye,
  Share2,
  MapPin,
  Globe,
  Mail,
  Send,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/app/lib/utils";
import { useLanguage } from "@/context/language-context";
import { LinkIcon } from "@/src/components/links/link-icon";
import { tLinks, type LinksLocale } from "@/src/lib/links-translations";
import { toStorageUrl } from "@/src/lib/storage-url";
import type { LinkItem, Profile, Role, Badge as ProfileBadge, Contact } from "@/src/types/database";

import logoBlack from "@/src/assets/images/fadilbaf-black.svg";
import logoWhite from "@/src/assets/images/fadilbaf-white.svg";

export type PreviewListItem =
  | {
      type: "group";
      id: string;
      name_id: string;
      name_en: string;
      itemCount?: number;
    }
  | {
      type: "link";
      id: string;
      data: LinkItem;
    };

interface LinksLivePreviewProps {
  items?: PreviewListItem[];
  links?: LinkItem[];
  profile: Profile | null;
  roles: Role[];
  badges?: ProfileBadge[];
  contact: Contact | null;
}

/** Verified badge SVG */
function VerifiedBadge() {
  return (
    <svg
      className="h-5 w-5 text-blue-500 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5a.749.749 0 01-1.041.208l-.115-.094-2.415-2.415a.75.75 0 111.06-1.06l1.77 1.767 3.825-5.74a.75.75 0 011.25.833z" />
    </svg>
  );
}

/** Social Brand Icons */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

/**
 * Preview LinkCard component faithful to public /links page with explicit theme styling (no dark: inheritance)
 */
function PreviewLinkCard({
  title,
  description,
  iconName,
  isMain,
  isDark,
}: {
  title: string;
  description?: string | null;
  iconName?: string | null;
  isMain?: boolean;
  isDark: boolean;
}) {
  if (isMain) {
    return (
      <div className="group relative p-[2px] rounded-[16px] border-none bg-[radial-gradient(circle_80px_at_80%_-10%,#ffffff,#181b1b)] block w-full shadow-md select-none">
        {/* Glow behind button (Top-Right) */}
        <div className="absolute top-0 right-0 w-[65%] h-[60%] rounded-[120px] shadow-[0_0_20px_#ffffff18] -z-10" />

        {/* Glow behind button (Bottom-Left) */}
        <div className="absolute bottom-0 left-0 w-[65%] h-[60%] rounded-[120px] shadow-[0_0_20px_#ffffff18] -z-10" />

        {/* Inner content */}
        <div className="relative flex items-center gap-4 rounded-[14px] bg-[radial-gradient(circle_80px_at_80%_-50%,#777777,#0f1111)] px-4 py-3.5 z-10 overflow-hidden text-white">
          {/* Inner glow layer */}
          <div className="absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_70px_at_0%_100%,#ffffff33,#ffffff0d,transparent)] z-[-1]" />

          {/* Icon */}
          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-neutral-300">
            <LinkIcon name={iconName} className="h-5 w-5" />
          </div>

          {/* Text Info */}
          <div className="relative z-10 flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {title}
            </p>
            {description && (
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                {description}
              </p>
            )}
          </div>

          <ExternalLink className="relative z-10 h-4 w-4 text-neutral-400 shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden flex items-center gap-4 rounded-xl border px-4 py-3.5 select-none transition-none",
        isDark
          ? "border-white/10 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-900 shadow-2xs"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          isDark ? "bg-white/10 text-neutral-400" : "bg-neutral-100 text-neutral-600"
        )}
      >
        <LinkIcon name={iconName} className="h-5 w-5" />
      </div>

      {/* Text Info */}
      <div className="relative z-10 flex-1 min-w-0">
        <p className={cn("text-sm font-semibold truncate", isDark ? "text-white" : "text-neutral-900")}>
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "text-xs truncate mt-0.5",
              isDark ? "text-neutral-400" : "text-neutral-500"
            )}
          >
            {description}
          </p>
        )}
      </div>

      <ExternalLink
        className={cn(
          "relative z-10 h-4 w-4 shrink-0",
          isDark ? "text-neutral-500" : "text-neutral-400"
        )}
      />
    </div>
  );
}

/**
 * Completely Static Profile Section without Framer-Motion
 */
function StaticProfileSection({
  profile,
  roles,
  contact,
  locale,
  isDark,
}: {
  profile: Profile | null;
  roles: Role[];
  contact: Contact | null;
  locale: LinksLocale;
  isDark: boolean;
}) {
  const currentRole =
    roles.length > 0
      ? locale === "id"
        ? roles[0]?.role_id
        : roles[0]?.role_en
      : "";

  const socialLinks = [
    { url: contact?.linkedin_url, icon: LinkedInIcon, label: "LinkedIn" },
    { url: contact?.github_url, icon: GitHubIcon, label: "GitHub" },
    { url: contact?.instagram_url, icon: InstagramIcon, label: "Instagram" },
    { url: contact?.tiktok_url, icon: TikTokIcon, label: "TikTok" },
  ].filter((link) => link.url);

  return (
    <section className="flex flex-col items-center text-center px-3.5 pt-8 pb-6">
      {/* Avatar */}
      {profile?.photo_url && (
        <div className="mb-4 select-none">
          <div
            className={cn(
              "relative h-28 w-28 rounded-2xl overflow-hidden border",
              isDark ? "border-white/10 bg-neutral-900" : "border-neutral-200 bg-neutral-100"
            )}
          >
            <Image
              src={toStorageUrl(profile.photo_url)}
              alt={profile.full_name || "Profile"}
              fill
              className="object-cover select-none profile-image-grayscale"
              sizes="112px"
              priority
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* Name + Verified Badge */}
      <h1 className={cn("text-2xl font-bold tracking-tight relative", isDark ? "text-white" : "text-neutral-900")}>
        <span className="relative inline-block">
          {profile?.full_name || "Fadil Bafagih"}
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-1.5 flex items-center">
            <VerifiedBadge />
          </span>
        </span>
      </h1>

      {/* Role */}
      {currentRole && (
        <p className={cn("text-sm mt-1", isDark ? "text-neutral-400" : "text-neutral-500")}>
          {currentRole}
        </p>
      )}

      {/* Location badges */}
      <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
        {contact?.location && (
          <span
            className={cn(
              "inline-flex items-center justify-center gap-1.5 w-36 rounded-lg bg-transparent py-1.5 text-xs font-medium border",
              isDark ? "text-neutral-400 border-white/10" : "text-neutral-600 border-neutral-200"
            )}
          >
            <MapPin className="h-3 w-3" />
            {contact.location}
          </span>
        )}
        <span
          className={cn(
            "inline-flex items-center justify-center gap-1.5 w-36 rounded-lg bg-transparent py-1.5 text-xs font-medium border",
            isDark ? "text-neutral-400 border-white/10" : "text-neutral-600 border-neutral-200"
          )}
        >
          <Globe className="h-3 w-3" />
          {tLinks(locale, "open_to_remote")}
        </span>
      </div>

      {/* Social media icons */}
      {socialLinks.length > 0 && (
        <div className="flex items-center gap-3 mt-5">
          {socialLinks.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl border",
                isDark
                  ? "border-white/10 bg-neutral-900 text-neutral-300"
                  : "border-neutral-200 bg-white text-neutral-700 shadow-2xs"
              )}
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Completely Static Contact Form Section without Framer-Motion
 */
function StaticContactSection({
  locale,
  isDark,
}: {
  locale: LinksLocale;
  isDark: boolean;
}) {
  return (
    <section className="px-3.5 pt-6 pb-6">
      <div
        className={cn(
          "rounded-xl border p-5",
          isDark
            ? "border-white/10 bg-neutral-900 text-white"
            : "border-neutral-200 bg-white text-neutral-900 shadow-2xs"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              isDark ? "bg-white/10 text-neutral-300" : "bg-neutral-100 text-neutral-700"
            )}
          >
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <h2 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-neutral-900")}>
              {tLinks(locale, "get_in_touch")}
            </h2>
            <p className={cn("text-xs mt-0.5", isDark ? "text-neutral-400" : "text-neutral-500")}>
              {tLinks(locale, "get_in_touch_desc")}
            </p>
          </div>
        </div>

        {/* Mockup Form Fields */}
        <div className="space-y-3.5">
          {/* Name Field */}
          <div>
            <label className={cn("block text-xs font-medium mb-1.5", isDark ? "text-neutral-300" : "text-neutral-700")}>
              {tLinks(locale, "name")}
            </label>
            <div
              className={cn(
                "h-9 px-3 rounded-lg border text-xs flex items-center",
                isDark
                  ? "border-white/10 bg-neutral-800/80 text-neutral-400"
                  : "border-neutral-200 bg-neutral-50/50 text-neutral-400"
              )}
            >
              {tLinks(locale, "name_placeholder")}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className={cn("block text-xs font-medium mb-1.5", isDark ? "text-neutral-300" : "text-neutral-700")}>
              {tLinks(locale, "email")}
            </label>
            <div
              className={cn(
                "h-9 px-3 rounded-lg border text-xs flex items-center",
                isDark
                  ? "border-white/10 bg-neutral-800/80 text-neutral-400"
                  : "border-neutral-200 bg-neutral-50/50 text-neutral-400"
              )}
            >
              {tLinks(locale, "email_placeholder")}
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className={cn("block text-xs font-medium mb-1.5", isDark ? "text-neutral-300" : "text-neutral-700")}>
              {tLinks(locale, "subject")}
            </label>
            <div
              className={cn(
                "h-9 px-3 rounded-lg border text-xs flex items-center justify-between",
                isDark
                  ? "border-white/10 bg-neutral-800/80 text-neutral-400"
                  : "border-neutral-200 bg-neutral-50/50 text-neutral-400"
              )}
            >
              <span>{tLinks(locale, "select_subject")}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </div>
          </div>

          {/* Message Field */}
          <div>
            <label className={cn("block text-xs font-medium mb-1.5", isDark ? "text-neutral-300" : "text-neutral-700")}>
              {tLinks(locale, "message")}
            </label>
            <div
              className={cn(
                "h-20 p-3 rounded-lg border text-xs leading-relaxed",
                isDark
                  ? "border-white/10 bg-neutral-800/80 text-neutral-400"
                  : "border-neutral-200 bg-neutral-50/50 text-neutral-400"
              )}
            >
              {tLinks(locale, "message_placeholder")}
            </div>
          </div>

          {/* Submit Button */}
          <div
            className={cn(
              "w-full h-9 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold select-none",
              isDark ? "bg-white text-neutral-900" : "bg-neutral-900 text-white"
            )}
          >
            <Send className="h-3.5 w-3.5" />
            {tLinks(locale, "send_message")}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Completely Static Footer Section
 */
function StaticFooterSection({
  locale,
  isDark,
}: {
  locale: LinksLocale;
  isDark: boolean;
}) {
  return (
    <footer className="py-4 px-3.5 space-y-1 text-center">
      <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-neutral-400")}>
        © {new Date().getFullYear()} Fadil Bafagih. {tLinks(locale, "all_rights")}
      </p>
      <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-neutral-400")}>
        {tLinks(locale, "build_with")}{" "}
        <span className={cn("font-bold", isDark ? "text-white" : "text-neutral-900")}>
          Bafdev
        </span>
      </p>
    </footer>
  );
}

export function LinksLivePreview({
  items,
  links = [],
  profile,
  roles,
  contact,
}: LinksLivePreviewProps) {
  const { t, language } = useLanguage();
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<"id" | "en">("id");
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");

  // Sync default values on client mount to eliminate any hydration mismatches
  useEffect(() => {
    setMounted(true);
    if (language === "en" || language === "id") {
      setPreviewLocale(language);
    }
    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      setPreviewTheme(resolvedTheme);
    }
  }, []);

  // Sync if dashboard language changes later
  useEffect(() => {
    if (mounted && (language === "id" || language === "en")) {
      setPreviewLocale(language);
    }
  }, [language, mounted]);

  // Sync if dashboard theme changes later
  useEffect(() => {
    if (mounted && (resolvedTheme === "dark" || resolvedTheme === "light")) {
      setPreviewTheme(resolvedTheme);
    }
  }, [resolvedTheme, mounted]);

  const isDark = previewTheme === "dark";
  const otherLocale = previewLocale === "en" ? "id" : "en";

  // Dynamic resolution for public website links URL (handling admin. subdomain vs public domain)
  const [publicLinksUrl, setPublicLinksUrl] = useState(`/${previewLocale}/links`);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname.toLowerCase();
      // Admin subdomain: admin.fadil.bafagih.id -> https://fadil.bafagih.id/{locale}/links
      if (hostname.startsWith("admin.")) {
        const publicHost = hostname.replace(/^admin\./, "");
        const port = window.location.port ? `:${window.location.port}` : "";
        setPublicLinksUrl(`${window.location.protocol}//${publicHost}${port}/${previewLocale}/links`);
      } else if (hostname === "admin") {
        setPublicLinksUrl(`https://fadil.bafagih.id/${previewLocale}/links`);
      } else if (process.env.NEXT_PUBLIC_SITE_URL) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
        setPublicLinksUrl(`${siteUrl}/${previewLocale}/links`);
      } else {
        setPublicLinksUrl(`/${previewLocale}/links`);
      }
    }
  }, [previewLocale]);

  // Fallback grouped links if items array is not provided
  const activeLinks = links.filter((l) => l.is_active);
  const fallbackGrouped = activeLinks.reduce<Record<string, LinkItem[]>>((acc, link) => {
    const groupName = previewLocale === "id" ? link.group_name_id : link.group_name_en;
    const key = groupName || (previewLocale === "id" ? "Utama" : "Main");
    if (!acc[key]) acc[key] = [];
    acc[key].push(link);
    return acc;
  }, {});

  return (
    <div className="w-full rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80 overflow-hidden shadow-none">
      {/* Container Header Toolbar (Outside phone) */}
      <div className="py-3 px-4 border-b border-neutral-200/60 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {t("links.preview_title")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Locale Switch */}
          <div className="flex items-center p-0.5 rounded-md border border-neutral-200 bg-neutral-100 dark:border-white/10 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setPreviewLocale("id")}
              className={cn(
                "px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer",
                previewLocale === "id"
                  ? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              )}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setPreviewLocale("en")}
              className={cn(
                "px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer",
                previewLocale === "en"
                  ? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              )}
            >
              EN
            </button>
          </div>

          {/* Theme Switch */}
          <div className="flex items-center p-0.5 rounded-md border border-neutral-200 bg-neutral-100 dark:border-white/10 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setPreviewTheme("light")}
              className={cn(
                "p-1 rounded transition-colors cursor-pointer",
                previewTheme === "light"
                  ? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              )}
              title="Light Mode"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme("dark")}
              className={cn(
                "p-1 rounded transition-colors cursor-pointer",
                previewTheme === "dark"
                  ? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              )}
              title="Dark Mode"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* External Public Link */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
            title={t("links.open_preview_tab")}
          >
            <a href={publicLinksUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="p-2 sm:p-3 bg-neutral-100/60 dark:bg-neutral-900/60 flex justify-center items-center">
        {/* Sleek Minimal Mockup Frame (No shadow) */}
        <div className="relative w-full max-w-[360px] rounded-[44px] p-1.5 bg-neutral-900 dark:bg-neutral-800 border-2 border-neutral-700/80 dark:border-neutral-600/60 overflow-hidden">
          {/* Screen Viewport with smooth internal scroll */}
          <div
            className={cn(
              "w-full h-[680px] rounded-[38px] overflow-hidden flex flex-col relative select-none isolate transition-none",
              isDark ? "bg-neutral-950 text-white" : "bg-white text-neutral-900"
            )}
          >
            {/* Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 h-[22px] w-[96px] bg-black rounded-full pointer-events-none flex items-center justify-between px-3">
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-900 ring-1 ring-neutral-800/80" />
              <div className="h-2 w-2 rounded-full bg-[#0d1b2a] ring-1 ring-blue-950/60" />
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto scrollbar-none overscroll-contain">
              {/* Header inside Phone (Exact match to LinksHeader, Static) */}
              <header
                className={cn(
                  "sticky top-0 z-30 flex h-14 items-center justify-between px-3.5 border-b pointer-events-none select-none",
                  isDark
                    ? "bg-neutral-950 border-white/10 text-white"
                    : "bg-white border-neutral-200/80 text-neutral-900"
                )}
              >
                <div className="flex items-center">
                  <Image
                    src={isDark ? logoWhite : logoBlack}
                    alt="Logo"
                    className="h-6 w-auto"
                  />
                </div>

                <div className="flex items-center gap-1.5 pointer-events-none select-none">
                  {/* 1. Language Switch with Globe + Badge (identical to LinksHeader) */}
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg border relative flex items-center justify-center",
                      isDark
                        ? "border-white/10 text-neutral-400"
                        : "border-neutral-200 text-neutral-600"
                    )}
                  >
                    <svg
                      className="h-3.5 w-3.5"
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
                    <span
                      className={cn(
                        "absolute -bottom-1 -right-1 z-0 flex h-3.5 min-w-[13px] items-center justify-center rounded-[3px] px-0.5 text-[7px] font-bold border leading-none uppercase",
                        isDark
                          ? "bg-white text-neutral-900 border-neutral-800"
                          : "bg-neutral-900 text-white border-neutral-200"
                      )}
                    >
                      {otherLocale}
                    </span>
                  </div>

                  {/* 2. Theme Toggle (identical to LinksHeader) */}
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg border relative flex items-center justify-center",
                      isDark
                        ? "border-white/10 text-neutral-400"
                        : "border-neutral-200 text-neutral-600"
                    )}
                  >
                    {isDark ? (
                      <Sun className="h-3.5 w-3.5" />
                    ) : (
                      <Moon className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* 3. Share Button (identical to LinksHeader) */}
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg border relative flex items-center justify-center",
                      isDark
                        ? "border-white/10 text-neutral-400"
                        : "border-neutral-200 text-neutral-600"
                    )}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </div>
                </div>
              </header>

              {/* Static Content faithful to public links page layout */}
              <div className="w-full pointer-events-none select-none">
                {/* 1. Profile Section */}
                <StaticProfileSection
                  profile={profile}
                  roles={roles}
                  contact={contact}
                  locale={previewLocale}
                  isDark={isDark}
                />

                {/* 2. Links Section with identical grouping, cards, and dividers */}
                <div className="px-3.5 space-y-6 pb-2">
                  <div
                    className={cn(
                      "border-t",
                      isDark ? "border-white/10" : "border-neutral-200/60"
                    )}
                  />

                  {items ? (
                    items.length === 0 ? (
                      <div className="text-center py-6 opacity-40 text-xs">
                        {previewLocale === "id" ? "Belum ada tautan aktif" : "No active links"}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map((it) => {
                          if (it.type === "group") {
                            return (
                              <p
                                key={it.id}
                                className={cn(
                                  "text-center text-xs font-medium uppercase tracking-wider pt-2 pb-1",
                                  isDark ? "text-neutral-500" : "text-neutral-400"
                                )}
                              >
                                {previewLocale === "id" ? it.name_id : it.name_en}
                              </p>
                            );
                          }

                          const link = it.data;
                          if (!link.is_active) return null;

                          const linkTitle = previewLocale === "id" ? link.title_id : link.title_en;
                          const linkDesc = previewLocale === "id" ? link.description_id : link.description_en;

                          return (
                            <PreviewLinkCard
                              key={link.id}
                              title={linkTitle || link.title_en || link.title_id}
                              description={linkDesc}
                              iconName={link.icon}
                              isMain={link.is_featured}
                              isDark={isDark}
                            />
                          );
                        })}
                      </div>
                    )
                  ) : Object.keys(fallbackGrouped).length === 0 ? (
                    <div className="text-center py-6 opacity-40 text-xs">
                      {previewLocale === "id" ? "Belum ada tautan aktif" : "No active links"}
                    </div>
                  ) : (
                    Object.entries(fallbackGrouped).map(([groupTitle, gLinks]) => (
                      <div key={groupTitle} className="space-y-2.5">
                        <p
                          className={cn(
                            "text-center text-xs font-medium uppercase tracking-wider",
                            isDark ? "text-neutral-500" : "text-neutral-400"
                          )}
                        >
                          {groupTitle}
                        </p>
                        <div className="space-y-2.5">
                          {gLinks.map((link) => {
                            const linkTitle = previewLocale === "id" ? link.title_id : link.title_en;
                            const linkDesc = previewLocale === "id" ? link.description_id : link.description_en;

                            return (
                              <PreviewLinkCard
                                key={link.id}
                                title={linkTitle || link.title_en || link.title_id}
                                description={linkDesc}
                                iconName={link.icon}
                                isMain={link.is_featured}
                                isDark={isDark}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Divider between last link and Contact form */}
                  <div
                    className={cn(
                      "border-t",
                      isDark ? "border-white/10" : "border-neutral-200/60"
                    )}
                  />
                </div>

                {/* 3. Contact Form Section */}
                <StaticContactSection locale={previewLocale} isDark={isDark} />

                {/* Divider between Contact form and Footer */}
                <div
                  className={cn(
                    "border-t",
                    isDark ? "border-white/10" : "border-neutral-200/60"
                  )}
                />

                {/* 4. Footer Component */}
                <StaticFooterSection locale={previewLocale} isDark={isDark} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
