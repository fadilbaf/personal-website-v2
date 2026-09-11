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
import { calculateReadingTime } from "@/src/lib/blog-utils";

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

  const handleSocialShare = (platform: "LinkedIn" | "WhatsApp" | "Threads") => {
    const url = window.location.href;
    const rawTitle = (locale === "id" ? blog.title_id : blog.title_en) || "";
    const cleanTitle = rawTitle.replace(/[\r\n]+/g, " ").trim();
    const author = (blog.author?.full_name || "Fadil Bafagih").replace(/[\r\n]+/g, " ").trim();
    const text =
      locale === "id"
        ? `"${cleanTitle}" oleh ${author}`
        : `"${cleanTitle}" by ${author}`;

    let shareUrl = "";
    if (platform === "LinkedIn") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    } else if (platform === "WhatsApp") {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`;
    } else if (platform === "Threads") {
      shareUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text}\n${url}`)}`;
    }

    if (shareUrl) {
      setDropdownOpen(false);
      setBottomDropdownOpen(false);
      setTimeout(() => {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }, 50);
    }
  };

  const shareChannels = [
    { name: "LinkedIn" as const, icon: LinkedInIcon, label: "LinkedIn" },
    { name: "WhatsApp" as const, icon: WhatsAppIcon, label: "WhatsApp" },
    { name: "Threads" as const, icon: ThreadsIcon, label: "Threads" },
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
  const readTimeMinutes = calculateReadingTime(blogContent);

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
    const itemReadTime = calculateReadingTime(itemText);
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
          initial={{ opacity: 0, filter: "blur(6px)", y: -10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
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
          initial={{ opacity: 0, filter: "blur(6px)", y: 15 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-5 text-left"
        >
          {/* Badges (Type & Category) */}
          {(blogType || blogCategory) && (
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {blogType && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-tight bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-white/10 shrink-0">
                  {blogType}
                </span>
              )}
              {blogCategory && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-tight bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-white/10 shrink-0">
                  {blogCategory}
                </span>
              )}
            </div>
          )}

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
          initial={{ opacity: 0, filter: "blur(6px)", y: 15 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center justify-between py-4 border-y border-neutral-200 dark:border-white/10 mt-6"
        >
          {/* Left: Views and Likes */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Views */}
            <div className={cn(actionBtnClass, "cursor-default select-none")}>
              <Eye className="h-4 w-4 shrink-0" />
              <span>{viewsCount} {tMain(locale, "views_label")}</span>
            </div>

            {/* Likes */}
            <button
              onClick={handleLikeToggle}
              className={cn(
                actionBtnClass,
                hasLiked
                  ? "text-red-600 hover:text-red-600 dark:text-red-500 dark:hover:text-red-500 font-semibold"
                  : ""
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
          </div>

          {/* Right: Share Button */}
          <DropdownMenu>
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
              collisionPadding={16}
              sideOffset={8}
              className="w-[210px] p-2.5"
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
        </motion.div>

        {/* 4. Two-Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
          {/* Main Article Content Column */}
          <motion.div
            initial={{ opacity: 0, filter: "blur(6px)", y: 15 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
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
            initial={{ opacity: 0, filter: "blur(6px)", y: 15 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-4 text-left space-y-8 pt-8 border-t border-neutral-200 dark:border-white/10 lg:border-t-0 lg:pt-0"
          >
            {/* MOST POPULAR */}
            {sidebarData.popular.length > 0 && (
              <div className="space-y-4">
                <div className="border-b-[2.5px] border-neutral-900 dark:border-white pb-1 w-fit">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    {tMain(locale, "most_popular")}
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
                    {tMain(locale, "related")}
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
                    {tMain(locale, "latest")}
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
          initial={{ opacity: 0, filter: "blur(6px)", y: 15 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 pb-0 border-t border-neutral-200 dark:border-white/10 mt-8"
        >
          {/* Left Column: Tags */}
          <div className="space-y-2">
            <span className="block text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {tMain(locale, "tags")}
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
                hasLiked
                  ? "text-red-600 hover:text-red-600 dark:text-red-500 dark:hover:text-red-500 font-semibold"
                  : ""
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
                collisionPadding={16}
                sideOffset={8}
                className="w-[210px] p-2.5"
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
