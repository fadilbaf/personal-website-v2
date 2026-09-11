"use client";

import { useState } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { tLinks, type LinksLocale } from "@/src/lib/links-translations";
import type { Contact } from "@/src/types/database";

/** Inline SVG brand icons for link cards */
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

/** Map of social platform to its icon component */
const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: LinkedInIcon,
  github: GitHubIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
};

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
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  index: number;
  isMain?: boolean;
}

function LinkCard({ href, title, description, icon: Icon, index, isMain = false }: LinkCardProps) {
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
        target="_blank"
        rel="noopener noreferrer"
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
        className="group relative p-[2px] rounded-[16px] border-none cursor-pointer bg-[radial-gradient(circle_80px_at_80%_-10%,#ffffff,#181b1b)] block w-full"
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
            <Icon className="h-5 w-5" />
          </div>
          <div className="relative z-10 flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              {title}
             </p>
            <p className="text-xs text-neutral-400 truncate">
              {description}
            </p>
          </div>
          <ExternalLink className="relative z-10 h-4 w-4 shrink-0 text-neutral-400 transition-colors duration-300 group-hover:text-white group-active:text-white" />
        </div>
      </motion.a>
    );
  }

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
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
        <Icon className="h-5 w-5" />
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {description}
        </p>
      </div>
      <ExternalLink className="relative z-10 h-4 w-4 shrink-0 text-neutral-400 transition-colors duration-300 group-hover:text-neutral-600 group-active:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 dark:group-active:text-neutral-300" />
    </motion.a>
  );
}

interface LinksSectionProps {
  contact: Contact | null;
  locale: LinksLocale;
}

/**
 * Link sections — Main (static links) + Social Media (from contacts data).
 */
export function LinksSection({ contact, locale }: LinksSectionProps) {
  const mainLinks = [
    {
      href: "https://fadil.bafagih.id/",
      title: tLinks(locale, "main_website_title"),
      description: tLinks(locale, "main_website_desc"),
      icon: Globe,
    },
    {
      href: "https://bafdev.id/",
      title: tLinks(locale, "bafdev_title"),
      description: tLinks(locale, "bafdev_desc"),
      icon: Globe,
    },
  ];

  const socialLinks = [
    {
      key: "linkedin",
      url: contact?.linkedin_url,
      titleKey: "linkedin_title",
      descKey: "linkedin_desc",
    },
    {
      key: "github",
      url: contact?.github_url,
      titleKey: "github_title",
      descKey: "github_desc",
    },
    {
      key: "instagram",
      url: contact?.instagram_url,
      titleKey: "instagram_title",
      descKey: "instagram_desc",
    },
    {
      key: "tiktok",
      url: contact?.tiktok_url,
      titleKey: "tiktok_title",
      descKey: "tiktok_desc",
    },
  ].filter((link) => link.url);

  return (
    <div className="px-3.5 space-y-6">
      {/* Separator */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-t border-neutral-200/60 dark:border-white/10" 
      />

      {/* Main section */}
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
          {mainLinks.map((link, index) => (
            <LinkCard key={link.href} {...link} index={index} isMain={true} />
          ))}
        </div>
      </div>

      {/* Social Media section */}
      {socialLinks.length > 0 && (
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
            {socialLinks.map((link, index) => (
              <LinkCard
                key={link.key}
                href={link.url!}
                title={tLinks(locale, link.titleKey)}
                description={tLinks(locale, link.descKey)}
                icon={socialIconMap[link.key] || Globe}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
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
