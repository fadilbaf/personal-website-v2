"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  Heart,
  Share2,
  Copy,
  Sparkles,
} from "lucide-react";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import { tLinks } from "@/src/lib/links-translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/src/app/lib/utils";
import { BlogService } from "@/src/services/blog.service";
import type { Blog } from "@/src/types/database";
import { BlogContentRenderer } from "@/components/main/blog-content-renderer";
import { trackEvent } from "@/src/lib/track-event";

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

interface BlogDetailClientProps {
  blog: Blog;
  locale: MainLocale;
}

export function BlogDetailClient({ blog, locale }: BlogDetailClientProps) {
  const [viewsCount, setViewsCount] = useState(blog.views_count || 0);
  const [likesCount, setLikesCount] = useState(blog.likes_count || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLikePopping, setIsLikePopping] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bottomDropdownOpen, setBottomDropdownOpen] = useState(false);

  const [sidebarData, setSidebarData] = useState<{
    popular: Blog[];
    related: Blog[];
    latest: Blog[];
  }>({
    popular: [],
    related: [],
    latest: [],
  });

  // Dynamic back URL state based on sessionStorage
  const [backUrl, setBackUrl] = useState(`/${locale}`);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prevPage = sessionStorage.getItem("prev_blog_page");
      if (prevPage === "all") {
        setBackUrl(`/${locale}/blogs`);
      } else {
        setBackUrl(`/${locale}`);
      }
    }
  }, [locale]);

  // 1. Increment views on mount & check localStorage like state
  useEffect(() => {
    BlogService.incrementViews(blog.id)
      .then(() => setViewsCount((prev) => prev + 1))
      .catch(() => {});

    const likedStorage = localStorage.getItem(`blog_liked_${blog.id}`);
    if (likedStorage === "true") {
      setHasLiked(true);
    }

    BlogService.getSidebarBlogs(blog.id, blog.category_id)
      .then(setSidebarData)
      .catch(() => {});
  }, [blog.id, blog.category_id]);

  // 2. Handle Likes toggle with custom toast & popup animation
  const handleLikeToggle = async () => {
    const delta = hasLiked ? -1 : 1;
    const newLiked = !hasLiked;
    setHasLiked(newLiked);
    setLikesCount((prev) => Math.max(0, prev + delta));

    if (newLiked) {
      localStorage.setItem(`blog_liked_${blog.id}`, "true");
      setIsLikePopping(true);
      setTimeout(() => setIsLikePopping(false), 450);
      toast(locale === "id" ? "Terima kasih atas apresiasinya!" : "Thank you for liking!", {
        icon: <Heart className="h-4 w-4 fill-red-500 text-red-500 shrink-0" />,
      });
    } else {
      localStorage.removeItem(`blog_liked_${blog.id}`);
    }

    try {
      await BlogService.incrementLikes(blog.id, delta);
    } catch {
      setHasLiked(!newLiked);
      setLikesCount((prev) => Math.max(0, prev - delta));
    }
  };

  // 3. Social Share & Copy URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(tLinks(locale as any, "copied"), {
        description: tLinks(locale as any, "copied_desc"),
      });
      setDropdownOpen(false);
      setBottomDropdownOpen(false);
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
      setDropdownOpen(false);
      setBottomDropdownOpen(false);
    }
  };

  const handleSocialShare = (platform: "X" | "Facebook" | "LinkedIn") => {
    const url = window.location.href;
    const blogTitle = locale === "id" ? blog.title_id : blog.title_en;
    const text =
      locale === "id"
        ? `Baca artikel ini: ${blogTitle}`
        : `Check out this article: ${blogTitle}`;

    let shareUrl = "";
    if (platform === "X") {
      shareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    } else if (platform === "Facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === "LinkedIn") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
      setDropdownOpen(false);
      setBottomDropdownOpen(false);
    }
  };

  const shareChannels = [
    { name: "X" as const, icon: XIcon, label: "X" },
    { name: "Facebook" as const, icon: FacebookIcon, label: "Facebook" },
    { name: "LinkedIn" as const, icon: LinkedInIcon, label: "LinkedIn" },
  ];

  // Format date helper
  const formatDate = (dateStr: string | null, activeLocale: MainLocale): string => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(activeLocale === "en" ? "en-US" : "id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const blogTitle = (locale === "id" ? blog.title_id : blog.title_en) || blog.title_id;
  const blogContent = (locale === "id" ? blog.content_id : blog.content_en) || blog.content_id || "";
  const blogType = (locale === "id" ? blog.type?.name_id : blog.type?.name_en) || blog.type?.name_en || "-";
  const blogCategory = (locale === "id" ? blog.category?.name_id : blog.category?.name_en) || blog.category?.name_en || "-";

  // Calculate read time
  const cleanText = blogContent.replace(/<[^>]*>/g, "");
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = formatDate(blog.created_at, locale);
  const authorName = blog.author?.full_name || "Fadil Bafagih";
  const authorAvatar = blog.author?.photo_url;

  const actionBtnClass = cn(
    "inline-flex items-center gap-1.5",
    "text-xs font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white",
    "transition-colors cursor-pointer select-none"
  );

  // Sidebar item component
  const SidebarArticleCard = ({ item }: { item: Blog }) => {
    const itemTitle = (locale === "id" ? item.title_id : item.title_en) || item.title_id;
    const itemText = (locale === "id" ? item.content_id : item.content_en) || item.content_id || "";
    const itemWords = itemText.replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length;
    const itemReadTime = Math.max(1, Math.ceil(itemWords / 200));
    const itemDate = formatDate(item.created_at, locale);

    return (
      <Link
        href={`/${locale}/blogs/${item.slug}`}
        onClick={() => {
          sessionStorage.setItem("prev_blog_page", "all");
        }}
        className="group flex items-start gap-3.5 py-1.5 transition-colors cursor-pointer"
      >
        <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={itemTitle}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 dark:text-neutral-600">
              <Sparkles className="w-5 h-5 opacity-40" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white line-clamp-2 leading-snug group-hover:underline group-active:underline underline-offset-2 transition-all">
            {itemTitle}
          </h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            {itemDate} • {itemReadTime} {tMain(locale, "min_read")}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <div className="w-full px-3.5 sm:px-12 md:px-24 lg:px-36 py-8 bg-transparent">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col">
        {/* 1. Back button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href={backUrl}
            onClick={() => {
              if (typeof window !== "undefined") {
                const prevPage = sessionStorage.getItem("prev_blog_page");
                if (prevPage === "home" || !prevPage) {
                  sessionStorage.setItem("scroll_to_blogs", "true");
                }
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{tMain(locale, "back")}</span>
          </Link>
        </motion.div>

        {/* 2. Title & Author Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-5 text-left"
        >
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-neutral-900 dark:text-white">
            {blogTitle}
          </h1>
          <div className="flex items-center gap-3.5 mt-4">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 shrink-0">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                  {(authorName || "A").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-base font-semibold text-neutral-900 dark:text-white leading-tight">
                {authorName}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-1 flex items-center gap-1.5">
                <span>{formattedDate}</span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 select-none">•</span>
                <span>{readTimeMinutes} {tMain(locale, "min_read")}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3. Metadata & Action Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-6 md:flex-row md:items-center justify-between py-3.5 border-y border-neutral-200 dark:border-white/10 mt-6"
        >
          {/* Left: Metadata (TYPE, CATEGORY) */}
          <div className="flex items-center gap-8 sm:gap-12 w-full md:w-auto">
            <div>
              <span className="block text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMain(locale, "type_label")}
              </span>
              <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 mt-1 block">
                {blogType}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {tMain(locale, "category_label")}
              </span>
              <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 mt-1 block">
                {blogCategory}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 w-full md:w-auto md:flex-row md:items-center md:gap-6">
            {/* Views */}
            <div className={cn(actionBtnClass, "cursor-default")}>
              <Eye className="h-4 w-4 shrink-0" />
              <span>{viewsCount} {tMain(locale, "views_label")}</span>
            </div>

            {/* Likes */}
            <button
              onClick={handleLikeToggle}
              className={cn(
                actionBtnClass,
                hasLiked ? "text-red-600 dark:text-red-500 font-semibold" : ""
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-300",
                  hasLiked ? "fill-red-600 text-red-600 dark:fill-red-500 dark:text-red-500" : "",
                  isLikePopping ? "scale-140 -rotate-12" : "scale-100"
                )}
              />
              <span>{likesCount} {tMain(locale, "likes_label")}</span>
            </button>

            {/* Share Dropdown */}
            <DropdownMenu onOpenChange={setDropdownOpen} open={dropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={() => trackEvent("blog_click", blogTitle + "-share")}
                  className={cn(
                    actionBtnClass,
                    "data-[state=open]:text-neutral-900 dark:data-[state=open]:text-white outline-none"
                  )}
                >
                  <Share2 className="h-4 w-4 shrink-0" />
                  <span>{tMain(locale, "share")}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[200px] p-2.5"
              >
                <div className="text-xs font-semibold px-0 pt-0.5 pb-2 text-neutral-500 dark:text-neutral-400">
                  {tLinks(locale as any, "share_links")}
                </div>
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
        </motion.div>

        {/* 4. Two-Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
          {/* Main Article Content Column */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-8 text-left space-y-8"
          >
            {/* Featured Image */}
            {blog.image_url && (
              <div className="group relative w-full aspect-video rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900">
                <img
                  src={blog.image_url}
                  alt={blogTitle}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-105"
                />
              </div>
            )}

            {/* Rich Content Renderer */}
            <BlogContentRenderer content={blogContent} />
          </motion.div>

          {/* Sidebar Column */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-4 text-left space-y-8 pt-8 border-t border-neutral-200 dark:border-white/10 lg:border-t-0 lg:pt-0"
          >
            {/* MOST POPULAR */}
            {sidebarData.popular.length > 0 && (
              <div className="space-y-4">
                <div className="border-b-[2.5px] border-neutral-900 dark:border-white pb-1 w-fit">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    {locale === "id" ? "TERPOPULER" : "MOST POPULAR"}
                  </h3>
                </div>
                <div className="space-y-3">
                  {sidebarData.popular.slice(0, 3).map((item) => (
                    <SidebarArticleCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* RELATED */}
            {sidebarData.related.length > 0 && (
              <div className="space-y-4">
                <div className="border-b-[2.5px] border-neutral-900 dark:border-white pb-1 w-fit">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    {locale === "id" ? "TERKAIT" : "RELATED"}
                  </h3>
                </div>
                <div className="space-y-3">
                  {sidebarData.related.slice(0, 3).map((item) => (
                    <SidebarArticleCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* LATEST */}
            {sidebarData.latest.length > 0 && (
              <div className="space-y-4">
                <div className="border-b-[2.5px] border-neutral-900 dark:border-white pb-1 w-fit">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    {locale === "id" ? "TERBARU" : "LATEST"}
                  </h3>
                </div>
                <div className="space-y-3">
                  {sidebarData.latest.slice(0, 3).map((item) => (
                    <SidebarArticleCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* 5. Full-Width Bottom Bar: Left Tags, Right Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 pb-0 border-t border-neutral-200 dark:border-white/10 mt-8"
        >
          {/* Left Column: Tags */}
          <div className="space-y-2">
            <span className="block text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              TAGS
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {blog.tags && blog.tags.length > 0 && (
                blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold tracking-wide"
                  >
                    #{tag}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Actions (Views, Likes, Share) */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 shrink-0">
            {/* Views */}
            <div className={cn(actionBtnClass, "cursor-default")}>
              <Eye className="h-4 w-4 shrink-0" />
              <span>{viewsCount} {tMain(locale, "views_label")}</span>
            </div>

            {/* Likes */}
            <button
              onClick={handleLikeToggle}
              className={cn(
                actionBtnClass,
                hasLiked ? "text-red-600 dark:text-red-500 font-semibold" : ""
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-300",
                  hasLiked ? "fill-red-600 text-red-600 dark:fill-red-500 dark:text-red-500" : "",
                  isLikePopping ? "scale-140 -rotate-12" : "scale-100"
                )}
              />
              <span>{likesCount} {tMain(locale, "likes_label")}</span>
            </button>

            {/* Share Dropdown */}
            <DropdownMenu onOpenChange={setBottomDropdownOpen} open={bottomDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={() => trackEvent("blog_click", blogTitle + "-share")}
                  className={cn(
                    actionBtnClass,
                    "data-[state=open]:text-neutral-900 dark:data-[state=open]:text-white outline-none"
                  )}
                >
                  <Share2 className="h-4 w-4 shrink-0" />
                  <span>{tMain(locale, "share")}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[200px] p-2.5"
              >
                <div className="text-xs font-semibold px-0 pt-0.5 pb-2 text-neutral-500 dark:text-neutral-400">
                  {tLinks(locale as any, "share_links")}
                </div>
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
        </motion.div>
      </div>
    </div>
  );
}
