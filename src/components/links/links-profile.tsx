"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { tLinks, type LinksLocale } from "@/src/lib/links-translations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Profile, Role, Contact } from "@/src/types/database";
import { toStorageUrl } from "@/src/lib/storage-url";

/** Inline SVG brand icons — consistent B&W style */
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

/** Verified badge (blue checkmark) */
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

interface LinksProfileProps {
  profile: Profile | null;
  roles: Role[];
  contact: Contact | null;
  locale: LinksLocale;
}

/**
 * Profile section — avatar, name, typing role animation, location badges, social icons.
 */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const avatarVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const textBlurVariants = {
  hidden: { opacity: 0, y: 15, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};



export function LinksProfile({
  profile,
  roles,
  contact,
  locale,
}: LinksProfileProps) {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Cycle through roles every 3 seconds
  useEffect(() => {
    if (roles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  const currentRole =
    roles.length > 0
      ? locale === "id"
        ? roles[currentRoleIndex]?.role_id
        : roles[currentRoleIndex]?.role_en
      : "";

  const socialLinks = [
    { url: contact?.linkedin_url, icon: LinkedInIcon, label: "LinkedIn" },
    { url: contact?.github_url, icon: GitHubIcon, label: "GitHub" },
    { url: contact?.instagram_url, icon: InstagramIcon, label: "Instagram" },
    { url: contact?.tiktok_url, icon: TikTokIcon, label: "TikTok" },
  ].filter((link) => link.url);

  return (
    <motion.section
      className="flex flex-col items-center text-center px-3.5 pt-8 pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Avatar — Square with rounded corners */}
      {profile?.photo_url && (
        <motion.div
          variants={avatarVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
          className="mb-4 cursor-pointer"
        >
          <div className="profile-photo-shimmer relative h-28 w-28 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-900">
            {isImageLoading && (
              <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse z-10" />
            )}
            <Image
              src={toStorageUrl(profile.photo_url)}
              alt={profile.full_name || "Profile"}
              fill
              className="object-cover select-none profile-image-grayscale"
              sizes="112px"
              priority
              onLoad={() => setIsImageLoading(false)}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </div>
        </motion.div>
      )}

      {/* Name + Verified Badge */}
      <motion.h1
        className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white relative"
        variants={textBlurVariants}
      >
        <span className="relative inline-block">
          {profile?.full_name || "Fadil Bafagih"}
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-1.5 flex items-center">
            <VerifiedBadge />
          </span>
        </span>
      </motion.h1>

      {/* Role with cycling animation */}
      <motion.div
        className="h-6 mt-1 overflow-hidden"
        variants={textBlurVariants}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={currentRoleIndex}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="text-sm text-neutral-500 dark:text-neutral-400"
          >
            {currentRole}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Location badges */}
      <motion.div
        className="flex items-center gap-2 mt-4 flex-wrap justify-center"
        variants={slideUpVariants}
      >
        {contact?.location && (
          <span className="inline-flex items-center justify-center gap-1.5 w-36 rounded-lg bg-transparent py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200 dark:text-neutral-400 dark:border-white/10">
            <MapPin className="h-3 w-3" />
            {contact.location}
          </span>
        )}
        <span className="inline-flex items-center justify-center gap-1.5 w-36 rounded-lg bg-transparent py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200 dark:text-neutral-400 dark:border-white/10">
          <Globe className="h-3 w-3" />
          {tLinks(locale, "open_to_remote")}
        </span>
      </motion.div>

      {/* Social media icons */}
      {/* Social media icons — each icon animated individually with index-based delay */}
      {socialLinks.length > 0 && (
        <TooltipProvider>
          <div className="flex items-center gap-3 mt-5">
            {socialLinks.map(({ url, icon: Icon, label }, index) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <motion.a
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      duration: 0.35,
                      ease: "easeOut" as const,
                      delay: 0.6 + index * 0.06,
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 active:bg-neutral-100 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:active:bg-neutral-800"
                    aria-label={label}
                    onClick={(e) => {
                      e.currentTarget.blur();
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      )}
    </motion.section>
  );
}
