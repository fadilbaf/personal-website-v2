"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ExternalLink,
  Moon,
  Sun,
  Globe,
  MapPin,
  Eye,
  Share2,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/app/lib/utils";
import { LinkIcon } from "@/src/components/links/link-icon";
import { toStorageUrl } from "@/src/lib/storage-url";
import { useLanguage } from "@/context/language-context";
import type { LinkItem, Profile, Role, Badge as ProfileBadge, Contact } from "@/src/types/database";

import logoBlack from "@/src/assets/images/fadilbaf-black.svg";
import logoWhite from "@/src/assets/images/fadilbaf-white.svg";

interface LinksLivePreviewProps {
  links: LinkItem[];
  profile: Profile | null;
  roles: Role[];
  badges: ProfileBadge[];
  contact: Contact | null;
}

export function LinksLivePreview({
  links,
  profile,
  roles,
  contact,
}: LinksLivePreviewProps) {
  const { t } = useLanguage();
  const [previewLocale, setPreviewLocale] = useState<"id" | "en">("id");
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");

  const isDark = previewTheme === "dark";

  // Filter active links for simulation
  const activeLinks = links.filter((l) => l.is_active);

  // Group links dynamically by group name
  const groupedLinks = activeLinks.reduce<Record<string, LinkItem[]>>((acc, link) => {
    const groupName = previewLocale === "id" ? link.group_name_id : link.group_name_en;
    const key = groupName || (previewLocale === "id" ? "Utama" : "Main");
    if (!acc[key]) acc[key] = [];
    acc[key].push(link);
    return acc;
  }, {});

  const currentRole =
    roles.length > 0
      ? previewLocale === "id"
        ? roles[0]?.role_id
        : roles[0]?.role_en
      : "Fullstack Developer";

  const otherLocale = previewLocale === "en" ? "id" : "en";

  return (
    <div className="w-full rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80 overflow-hidden shadow-none">
      {/* Container Header Toolbar matching Broadcast tab */}
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
            <a href={`/${previewLocale}/links`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Preview Content Area with Phone Frame */}
      <div className="p-4 sm:p-6 bg-neutral-100/60 dark:bg-neutral-900/60 flex justify-center">
        {/* Sleek Thinner-Bezel Phone Mockup */}
        <div className="relative w-full max-w-[340px] rounded-[34px] p-1.5 bg-neutral-900 shadow-2xl border-2 border-neutral-800 dark:border-neutral-700/80 ring-1 ring-black/20">
          {/* Dynamic Island Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 h-3.5 w-20 bg-neutral-950 rounded-full z-20 flex items-center justify-end px-2">
            <div className="h-1.5 w-1.5 rounded-full bg-neutral-800/80" />
          </div>

          {/* Screen Viewport */}
          <div
            className={cn(
              "w-full h-[580px] rounded-[28px] overflow-y-auto scrollbar-none transition-colors duration-300 relative select-none",
              isDark ? "bg-neutral-950 text-white" : "bg-white text-neutral-900"
            )}
          >
            {/* Header inside Phone */}
            <header
              className={cn(
                "sticky top-0 z-10 flex h-13 items-center justify-between px-3.5 border-b backdrop-blur-md",
                isDark
                  ? "bg-neutral-950/80 border-white/10"
                  : "bg-white/80 border-neutral-200/80"
              )}
            >
              <img
                src={isDark ? logoWhite.src : logoBlack.src}
                alt="Logo"
                className="h-5 w-auto"
              />
              <div className="flex items-center gap-1.5">
                {/* Language pill */}
                <button
                  type="button"
                  onClick={() => setPreviewLocale(otherLocale)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border text-[10px] font-bold uppercase transition-colors cursor-pointer",
                    isDark
                      ? "border-white/10 text-neutral-300 hover:bg-white/10"
                      : "border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                  )}
                  title="Switch Language"
                >
                  {otherLocale}
                </button>
                {/* Theme button */}
                <button
                  type="button"
                  onClick={() => setPreviewTheme(isDark ? "light" : "dark")}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border text-neutral-400 transition-colors cursor-pointer",
                    isDark
                      ? "border-white/10 hover:bg-white/10 hover:text-white"
                      : "border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900"
                  )}
                >
                  {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </button>
                {/* Share button */}
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border text-neutral-400",
                    isDark ? "border-white/10" : "border-neutral-200"
                  )}
                >
                  <Share2 className="h-3.5 w-3.5" />
                </div>
              </div>
            </header>

            {/* Profile Section */}
            <div className="flex flex-col items-center text-center px-4 pt-6 pb-4">
              {profile?.photo_url ? (
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 mb-3 shadow-xs">
                  <Image
                    src={toStorageUrl(profile.photo_url)}
                    alt={profile.full_name || "Profile"}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xl mb-3">
                  {profile?.full_name?.charAt(0) || "F"}
                </div>
              )}

              <h3 className="font-bold text-base tracking-tight flex items-center gap-1.5">
                {profile?.full_name || "Fadil Bafagih"}
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[10px] font-bold">
                  ✓
                </span>
              </h3>

              <p className="text-xs opacity-60 mt-1">{currentRole}</p>

              {/* Location Badges */}
              <div className="flex items-center gap-2 mt-3.5 flex-wrap justify-center text-[10px]">
                {contact?.location && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border",
                      isDark
                        ? "border-white/10 text-neutral-300 bg-neutral-900/40"
                        : "border-neutral-200 text-neutral-600 bg-neutral-50/60"
                    )}
                  >
                    <MapPin className="h-3 w-3" />
                    {contact.location}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border",
                    isDark
                      ? "border-white/10 text-neutral-300 bg-neutral-900/40"
                      : "border-neutral-200 text-neutral-600 bg-neutral-50/60"
                  )}
                >
                  <Globe className="h-3 w-3" />
                  Open to Remote
                </span>
              </div>
            </div>

            {/* Dynamic Links Section */}
            <div className="px-3.5 space-y-4">
              {Object.keys(groupedLinks).length === 0 ? (
                <div className="text-center py-6 opacity-40 text-xs">
                  {previewLocale === "id" ? "Belum ada tautan aktif" : "No active links"}
                </div>
              ) : (
                Object.entries(groupedLinks).map(([groupTitle, items]) => (
                  <div key={groupTitle} className="space-y-2">
                    <p className="text-center text-[10px] font-semibold uppercase tracking-wider opacity-40 pt-1">
                      {groupTitle}
                    </p>

                    <div className="space-y-2">
                      {items.map((link) => {
                        const linkTitle = previewLocale === "id" ? link.title_id : link.title_en;
                        const linkDesc = previewLocale === "id" ? link.description_id : link.description_en;

                        if (link.is_featured) {
                          return (
                            <div
                              key={link.id}
                              className="relative p-[1.5px] rounded-xl bg-[radial-gradient(circle_80px_at_80%_-10%,#ffffff,#181b1b)] block w-full overflow-hidden shadow-xs"
                            >
                              <div className="flex items-center gap-3 rounded-[11px] bg-[radial-gradient(circle_80px_at_80%_-50%,#777777,#0f1111)] px-3 py-2.5 text-white">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-neutral-200">
                                  <LinkIcon name={link.icon} className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold truncate text-white">
                                    {linkTitle || link.title_en}
                                  </p>
                                  {linkDesc && (
                                    <p className="text-[10px] text-neutral-300 truncate">
                                      {linkDesc}
                                    </p>
                                  )}
                                </div>
                                <ExternalLink className="h-3 w-3 text-neutral-400 shrink-0" />
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={link.id}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors shadow-2xs",
                              isDark
                                ? "border-white/10 bg-neutral-900/80 text-white"
                                : "border-neutral-200/70 bg-white/90 text-neutral-900"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                isDark
                                  ? "bg-white/10 text-neutral-300"
                                  : "bg-neutral-100 text-neutral-700"
                              )}
                            >
                              <LinkIcon name={link.icon} className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate">
                                {linkTitle || link.title_en}
                              </p>
                              {linkDesc && (
                                <p className="text-[10px] opacity-60 truncate">
                                  {linkDesc}
                                </p>
                              )}
                            </div>
                            <ExternalLink className="h-3 w-3 opacity-40 shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Contact Section Preview */}
            <div className="px-3.5 pt-5 pb-4">
              <div
                className={cn(
                  "rounded-xl border p-3.5 space-y-3",
                  isDark
                    ? "border-white/10 bg-neutral-900/60 text-white"
                    : "border-neutral-200/80 bg-neutral-50/70 text-neutral-900"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md",
                      isDark ? "bg-white/10 text-white" : "bg-neutral-200/70 text-neutral-800"
                    )}
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">
                      {previewLocale === "id" ? "Hubungi Saya" : "Get In Touch"}
                    </p>
                    <p className="text-[10px] opacity-60">
                      {previewLocale === "id"
                        ? "Kirim pesan untuk kolaborasi atau peluang"
                        : "Feel free to reach out for collaborations"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div
                    className={cn(
                      "h-7 rounded-md border px-2 text-[10px] flex items-center opacity-60",
                      isDark ? "border-white/10 bg-neutral-950/60" : "border-neutral-200 bg-white"
                    )}
                  >
                    {previewLocale === "id" ? "Nama Anda" : "Your name"}
                  </div>
                  <div
                    className={cn(
                      "h-7 rounded-md border px-2 text-[10px] flex items-center opacity-60",
                      isDark ? "border-white/10 bg-neutral-950/60" : "border-neutral-200 bg-white"
                    )}
                  >
                    {previewLocale === "id" ? "Alamat email" : "Email address"}
                  </div>
                  <div
                    className={cn(
                      "h-12 rounded-md border p-2 text-[10px] opacity-60",
                      isDark ? "border-white/10 bg-neutral-950/60" : "border-neutral-200 bg-white"
                    )}
                  >
                    {previewLocale === "id" ? "Tulis pesan..." : "Write message..."}
                  </div>
                  <div
                    className={cn(
                      "h-8 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-semibold",
                      isDark
                        ? "bg-white text-neutral-950"
                        : "bg-neutral-900 text-white"
                    )}
                  >
                    <Send className="h-3 w-3" />
                    {previewLocale === "id" ? "Kirim Pesan" : "Send Message"}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer inside Phone */}
            <footer
              className={cn(
                "border-t px-4 py-4 text-center space-y-1 mt-2 text-[10px]",
                isDark ? "border-white/10 text-neutral-500" : "border-neutral-200 text-neutral-400"
              )}
            >
              <p>© {new Date().getFullYear()} Fadil Bafagih. All Rights Reserved.</p>
              <p className="text-[9px] opacity-70">
                Build with Next.js, Tailwind CSS & Supabase
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
