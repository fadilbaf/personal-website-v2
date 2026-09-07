"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ArrowRight, Heart, Eye } from "lucide-react";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Blog } from "@/src/types/database";

interface MainBlogsProps {
  blogs: Blog[];
  locale: MainLocale;
}

const cardVariants = {
  hidden: { opacity: 0, filter: "blur(6px)", y: 6 },
  visible: (custom: { index: number }) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
      delay: custom.index * 0.15,
    },
  }),
};

const formatDate = (dateStr: string | null, locale: MainLocale): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const calculateReadingTime = (content: string | null): number => {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const stripMarkdown = (content: string | null): string => {
  if (!content) return "";
  
  // Replace paragraph ends and line breaks with newlines to preserve "enter"
  let cleaned = content
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, ""); // Strip other HTML tags
  
  // Replace HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&middot;/gi, "•")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—");

  // Collapse multiple horizontal spaces/tabs but preserve newlines
  cleaned = cleaned.replace(/[ \t]+/g, " ");
  
  // Normalize consecutive newlines to maximum of 2 to avoid huge blank spaces
  cleaned = cleaned.replace(/\n\s*\n/g, "\n\n");

  return cleaned.trim();
};

export function MainBlogs({ blogs, locale }: MainBlogsProps) {
  // Filter and get only published blogs
  const publishedBlogs = blogs.filter((b) => b.is_published);

  // Display maximum of 3 cards on both desktop and mobile
  const displayedBlogs = publishedBlogs.slice(0, 3);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const scrollFlag = sessionStorage.getItem("scroll_to_blogs");
      if (scrollFlag === "true") {
        sessionStorage.removeItem("scroll_to_blogs");
        setTimeout(() => {
          const element = document.getElementById("blogs");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  }, []);

  if (displayedBlogs.length === 0) return null;

  return (
    <section id="blogs" className="scroll-mt-20 w-full px-3.5 sm:px-12 md:px-24 lg:px-36 pt-4 pb-6 md:pt-6 md:pb-8 bg-transparent">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Section Header */}
        <div className="flex flex-row items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-1.5 text-left w-full"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-[22px] w-[22px] text-neutral-900 dark:text-white" />
              <h2 className="text-[24px] leading-none font-medium tracking-tight text-neutral-900 dark:text-white">
                {tMain(locale, "blogs_title")}
              </h2>
            </div>
            <p className="text-[15px] font-regular text-neutral-500 dark:text-neutral-400">
              {tMain(locale, "blogs_desc")}
            </p>
            {/* Mobile View All Button */}
            <div className="flex md:hidden mt-2">
              <Link
                href={`/${locale}/blogs`}
                className="group/btn inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-4 py-2.5 text-xs font-semibold transition-colors duration-200 hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-100 cursor-pointer"
              >
                <span>{tMain(locale, "view_all_blogs")}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
            className="hidden md:block shrink-0"
          >
            <Link
              href={`/${locale}/blogs`}
              className="group/btn inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-4 py-2.5 text-xs font-semibold transition-colors duration-200 hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-100 cursor-pointer"
            >
              <span>{tMain(locale, "view_all_blogs")}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Blogs List */}
        <div className="flex flex-col gap-6">
          {displayedBlogs.map((blog, index) => {
            const content = locale === "id" ? blog.content_id : blog.content_en;
            const rawExcerpt = stripMarkdown(content);
            const excerpt = rawExcerpt.length > 200 ? rawExcerpt.slice(0, 200).trim() + "..." : rawExcerpt;
            const readingTime = calculateReadingTime(content);
            const formattedDate = formatDate(blog.created_at, locale);

            return (
              <motion.div
                key={blog.id}
                custom={{ index }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={cardVariants}
                className="group relative flex flex-col rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900/50 backdrop-blur-sm p-5 text-left transition-colors duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 active:border-neutral-300 dark:active:border-neutral-700"
              >
                {/* 1. Meta Row (Author Profile, Name, Date, Reading Time) */}
                <div className="flex items-center gap-3">
                  {blog.author?.photo_url ? (
                    <img
                      src={blog.author.photo_url}
                      alt={blog.author.full_name || "Author"}
                      className="h-6 w-6 rounded-full object-cover border border-neutral-100 dark:border-neutral-800"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                      {(blog.author?.full_name || "A").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-normal text-left">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {blog.author?.full_name || "Author"}
                    </span>
                    <span className="text-[10px] mx-1.5 text-neutral-400 dark:text-neutral-500 select-none relative -top-px">•</span>
                    <span>
                      {formattedDate}
                    </span>
                    <span className="text-[10px] mx-1.5 text-neutral-400 dark:text-neutral-500 select-none relative -top-px">•</span>
                    <span>
                      {readingTime} {tMain(locale, "min_read")}
                    </span>
                  </p>
                </div>

                {/* 2. Title Row (Max 1 Line) */}
                <h3 className="text-base sm:text-[18px] font-semibold text-neutral-900 dark:text-white line-clamp-1 leading-snug mt-3 group-hover:underline group-active:underline underline-offset-2 transition-all">
                  {locale === "id" ? blog.title_id : blog.title_en}
                </h3>

                {/* 3. Spoiler/Content Row (Max 2 Lines) */}
                <p className="text-[13px] font-normal text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed whitespace-pre-line mt-2">
                  {excerpt}
                </p>

                {/* 4. Action/Engagement Bottom Row */}
                <div className="flex items-center justify-between gap-4 mt-5">
                  {/* Views and Likes Badge */}
                  <div className="inline-flex items-center gap-4 rounded-lg border border-neutral-200 dark:border-white/10 px-3.5 py-2.5 bg-white dark:bg-neutral-900/50 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300" />
                      <span>{blog.views_count ?? 0} {tMain(locale, "views_label")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300" />
                      <span>{blog.likes_count ?? 0} {tMain(locale, "likes_label")}</span>
                    </div>
                  </div>

                  {/* Read More Button */}
                  <Link
                    href={`/${locale}/blogs/${blog.slug}`}
                    onClick={() => sessionStorage.setItem("prev_blog_page", "home")}
                    className="h-10 inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 px-4 text-xs font-semibold transition-colors duration-200 cursor-pointer"
                  >
                    <span>{tMain(locale, "read_more")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
