"use client";

import React, { useState } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { tLinks, type LinksLocale } from "@/src/lib/links-translations";
import { LinkIcon } from "@/src/components/links/link-icon";
import type { Contact, LinkItem } from "@/src/types/database";

/** Animation variants for section elements */
const subtitleVariants = {
  hidden: { opacity: 0, y: 15, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

interface LinkCardProps {
  href: string;
  title: string;
  description?: string | null;
  iconName?: string | null;
  index: number;
  isMain?: boolean;
  openInNewTab?: boolean;
}

function LinkCard({
  href,
  title,
  description,
  iconName,
  index,
  isMain = false,
  openInNewTab = true,
}: LinkCardProps) {
  const [isShimmering, setIsShimmering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  if (isMain) {
    return (
      <motion.a
        href={href}
        target={openInNewTab ? "_blank" : "_self"}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        whileTap={{ y: -3 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{
          duration: 0.4,
          ease: "easeOut" as const,
          delay: index * 0.08,
        }}
        onMouseEnter={() => setIsShimmering(true)}
        className="group relative p-[2px] rounded-[16px] border-none cursor-pointer bg-[radial-gradient(circle_80px_at_80%_-10%,#ffffff,#181b1b)] block w-full shadow-md"
      >
        {/* Glow behind button (Top-Right) */}
        <div className="absolute top-0 right-0 w-[65%] h-[60%] rounded-[120px] shadow-[0_0_20px_#ffffff18] group-hover:shadow-[0_0_40px_#ffffff30] group-active:shadow-[0_0_40px_#ffffff30] transition-all duration-300 ease-out -z-10" />

        {/* Glow behind button (Bottom-Left) */}
        <div className="absolute bottom-0 left-0 w-[65%] h-[60%] rounded-[120px] shadow-[0_0_20px_#ffffff18] group-hover:shadow-[0_0_40px_#ffffff30] group-active:shadow-[0_0_40px_#ffffff30] transition-all duration-300 ease-out -z-10" />

        {/* Inner content */}
        <div className="relative flex items-center gap-4 rounded-[14px] bg-[radial-gradient(circle_80px_at_80%_-50%,#777777,#0f1111)] px-4 py-3.5 transition-colors duration-300 z-10 overflow-hidden">
          {/* Shimmer sweep layer */}
          {isShimmering && (
            <div
              className="main-card-shimmer"
              onAnimationEnd={() => setIsShimmering(false)}
            />
          )}

          {/* Inner glow layer */}
          <div className="absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_70px_at_0%_100%,#ffffff33,#ffffff0d,transparent)] z-[-1]" />

          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-neutral-300 transition-colors group-hover:bg-white group-hover:text-neutral-900 group-active:bg-white group-active:text-neutral-900">
            <LinkIcon name={iconName} className="h-5 w-5" />
          </div>
          <div className="relative z-10 flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {title}
            </p>
            {description && (
              <p className="text-xs text-neutral-400 truncate">
                {description}
              </p>
            )}
          </div>
          <ExternalLink className="relative z-10 h-4 w-4 shrink-0 text-neutral-400 transition-colors duration-300 group-hover:text-white group-active:text-white" />
        </div>
      </motion.a>
    );
  }

  return (
    <motion.a
      href={href}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      whileTap={{ y: -3 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.4,
        ease: "easeOut" as const,
        delay: index * 0.08,
      }}
      onMouseMove={handleMouseMove}
      className="link-card-custom group relative overflow-hidden flex items-center gap-4 rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm px-4 py-3.5 transition-colors duration-300 hover:shadow-md active:shadow-md dark:border-white/10 dark:bg-neutral-900/80 dark:hover:shadow-white/5 dark:active:shadow-white/5"
    >
      {/* Spotlight cursor overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 z-3"
        style={{
          background: `radial-gradient(150px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), var(--spotlight-color), transparent 80%)`,
        }}
      />

      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-neutral-900 group-hover:text-white group-active:bg-neutral-900 group-active:text-white dark:bg-white/10 dark:text-neutral-400 dark:group-hover:bg-white dark:group-hover:text-neutral-900 dark:group-active:bg-white dark:group-active:text-neutral-900">
        <LinkIcon name={iconName} className="h-5 w-5" />
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
          {title}
        </p>
        {description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {description}
          </p>
        )}
      </div>
      <ExternalLink className="relative z-10 h-4 w-4 shrink-0 text-neutral-400 transition-colors duration-300 group-hover:text-neutral-600 group-active:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 dark:group-active:text-neutral-300" />
    </motion.a>
  );
}

interface LinksSectionProps {
  links?: LinkItem[];
  contact: Contact | null;
  locale: LinksLocale;
}

/**
 * Dynamic Links Section grouped by group_name_id / group_name_en.
 * Fully responsive with fallback to contacts when empty.
 */
export function LinksSection({ links = [], contact, locale }: LinksSectionProps) {
  // If links are provided dynamically from Supabase
  if (links && links.length > 0) {
    const groupedLinks = links.reduce<Record<string, LinkItem[]>>((acc, link) => {
      const groupName = locale === "id" ? link.group_name_id : link.group_name_en;
      const key = groupName || (locale === "id" ? "Utama" : "Main");
      if (!acc[key]) acc[key] = [];
      acc[key].push(link);
      return acc;
    }, {});

    return (
      <div className="px-3.5 space-y-6">
        {/* Top Separator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border-t border-neutral-200/60 dark:border-white/10"
        />

        {/* Dynamic Link Groups */}
        {Object.entries(groupedLinks).map(([groupTitle, items], gIdx) => (
          <div key={groupTitle} className="space-y-3">
            <motion.p
              variants={subtitleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="text-center text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
            >
              {groupTitle}
            </motion.p>
            <div className="space-y-2.5">
              {items.map((link, index) => {
                const title = locale === "id" ? link.title_id : link.title_en;
                const desc = locale === "id" ? link.description_id : link.description_en;

                return (
                  <LinkCard
                    key={link.id}
                    href={link.url}
                    title={title || link.title_en || link.title_id}
                    description={desc}
                    iconName={link.icon}
                    index={gIdx * 3 + index}
                    isMain={link.is_featured}
                    openInNewTab={link.open_in_new_tab}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Bottom Separator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border-t border-neutral-200/60 dark:border-white/10"
        />
      </div>
    );
  }

  // Fallback if links table is empty
  const fallbackMainLinks = [
    {
      href: "https://fadil.bafagih.id/",
      title: tLinks(locale, "main_website_title"),
      description: tLinks(locale, "main_website_desc"),
      iconName: "Globe",
    },
    {
      href: "https://bafdev.id/",
      title: tLinks(locale, "bafdev_title"),
      description: tLinks(locale, "bafdev_desc"),
      iconName: "Globe",
    },
  ];

  const fallbackSocialLinks = [
    { key: "linkedin", url: contact?.linkedin_url, titleKey: "linkedin_title", descKey: "linkedin_desc", iconName: "Linkedin" },
    { key: "github", url: contact?.github_url, titleKey: "github_title", descKey: "github_desc", iconName: "Github" },
    { key: "instagram", url: contact?.instagram_url, titleKey: "instagram_title", descKey: "instagram_desc", iconName: "Instagram" },
    { key: "tiktok", url: contact?.tiktok_url, titleKey: "tiktok_title", descKey: "tiktok_desc", iconName: "Tiktok" },
  ].filter((link) => link.url);

  return (
    <div className="px-3.5 space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-t border-neutral-200/60 dark:border-white/10"
      />

      <div className="space-y-3">
        <motion.p
          variants={subtitleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="text-center text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
        >
          {tLinks(locale, "main")}
        </motion.p>
        <div className="space-y-2.5">
          {fallbackMainLinks.map((link, index) => (
            <LinkCard key={link.href} {...link} index={index} isMain={true} />
          ))}
        </div>
      </div>

      {fallbackSocialLinks.length > 0 && (
        <div className="space-y-3">
          <motion.p
            variants={subtitleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="text-center text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
          >
            {tLinks(locale, "social_media")}
          </motion.p>
          <div className="space-y-2.5">
            {fallbackSocialLinks.map((link, index) => (
              <LinkCard
                key={link.key}
                href={link.url!}
                title={tLinks(locale, link.titleKey)}
                description={tLinks(locale, link.descKey)}
                iconName={link.iconName}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-t border-neutral-200/60 dark:border-white/10"
      />
    </div>
  );
}
