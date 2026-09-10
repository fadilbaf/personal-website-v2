"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Profile, Contact, About, Role } from "@/src/types/database";
import fadilbafBlackImage from "@/src/assets/images/fadilbaf-black.png";
import fadilbafWhiteImage from "@/src/assets/images/fadilbaf-white.png";

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

interface MainHeroProps {
  profile: Profile | null;
  roles: Role[];
  about: About | null;
  contact: Contact | null;
  locale: MainLocale;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)", scale: 1 },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { 
      duration: 0.7, 
      ease: "easeOut" as const,
      scale: { duration: 0.5, ease: "easeOut" }
    },
  },
};

export function MainHero({ profile, roles, about, contact, locale }: MainHeroProps) {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  const badgeText = locale === "id" ? about?.badge_id : about?.badge_en;
  const bioText = locale === "id" ? about?.bio_id : about?.bio_en;

  useEffect(() => {
    setMounted(true);
  }, []);

  const heroImage = mounted && resolvedTheme === "dark" ? fadilbafBlackImage : fadilbafWhiteImage;
  
  // Cycle through roles every 3 seconds
  useEffect(() => {
    if (roles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  // Handle smooth scroll from other pages via sessionStorage or URL hash
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hashTarget = window.location.hash ? window.location.hash.replace("#", "") : null;
    const target =
      sessionStorage.getItem("scroll-target") ||
      (sessionStorage.getItem("scroll_to_about") ? "about" : null) ||
      (sessionStorage.getItem("scroll_to_experiences") ? "experiences" : null) ||
      (sessionStorage.getItem("scroll_to_projects") ? "projects" : null) ||
      (sessionStorage.getItem("scroll_to_achievements") ? "achievements" : null) ||
      (sessionStorage.getItem("scroll_to_blogs") ? "blogs" : null) ||
      (sessionStorage.getItem("scroll_to_contact") ? "contact" : null) ||
      hashTarget;

    if (!target) return;

    // Ensure body/html overflow are unlocked
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    const performScroll = () => {
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Retry scroll across render lifecycle to guarantee target is reached even while components mount
    const t0 = setTimeout(performScroll, 50);
    const t1 = setTimeout(performScroll, 200);
    const t2 = setTimeout(performScroll, 500);
    const t3 = setTimeout(performScroll, 900);

    // Clean URL hash & sessionStorage after smooth scroll has initiated
    const cleanTimer = setTimeout(() => {
      sessionStorage.removeItem("scroll-target");
      sessionStorage.removeItem("scroll_to_about");
      sessionStorage.removeItem("scroll_to_experiences");
      sessionStorage.removeItem("scroll_to_projects");
      sessionStorage.removeItem("scroll_to_achievements");
      sessionStorage.removeItem("scroll_to_blogs");
      sessionStorage.removeItem("scroll_to_contact");
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }, 1200);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(cleanTimer);
    };
  }, []);

  const handleScrollToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById("about");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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
      id="hero"
      className="relative min-h-0 flex flex-col items-center justify-start px-3.5 sm:px-12 md:px-24 lg:px-36 pt-16 md:pt-24 pb-12 overflow-hidden bg-transparent"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-center h-auto relative z-10">
        
        {/* Left Column: Badge, Greeting & Name, Bio, CTAs, Social Icons */}
        <div className="flex flex-col justify-center items-start text-left order-1 lg:col-span-7 z-10 relative gap-6 py-4">
          
          {/* Top: Badge */}
          <motion.div variants={fadeUpVariants} className="w-fit">
            <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white/50 px-4 py-2 text-sm text-neutral-600 dark:border-white/10 dark:bg-neutral-900/50 dark:text-neutral-400 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {badgeText || tMain(locale, "available")}
            </span>
          </motion.div>

          {/* Name & Role Section */}
          <div className="flex flex-col gap-2 w-full mt-2">
            <motion.p variants={fadeUpVariants} className="text-neutral-500 dark:text-neutral-400 font-medium text-sm md:text-base">
              {tMain(locale, "hello")}
            </motion.p>
            <motion.h1 variants={fadeUpVariants} className="text-5xl md:text-6xl lg:text-[76px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.05] max-w-2xl">
              {profile?.full_name || "Fadil Bafagih"}
            </motion.h1>
            
            {/* Role with cycling animation */}
            <motion.div variants={fadeUpVariants} className="h-8 md:h-9 overflow-hidden flex items-center justify-start">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentRoleIndex}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 font-regular"
                >
                  {currentRole || "Full-Stack Developer"}
                </motion.h2>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Bio text */}
          <motion.p
            variants={fadeUpVariants}
            className="hidden md:block text-neutral-500 dark:text-neutral-400 text-sm md:text-[15px] leading-relaxed max-w-[520px] -mt-2"
          >
            {bioText || (locale === "id" 
              ? "Mengubah ide menjadi solusi digital kreatif yang menginspirasi dan menarik, dengan fokus pada kegunaan, inovasi, dan desain yang berpusat pada manusia."
              : "Transforming ideas into creative digital solutions that inspire and engage, with a focus on usability, innovation, and human-centered design.")
            }
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUpVariants} className="flex flex-row flex-wrap items-center gap-3 w-full mt-2 z-20">
            <Link
              href="#contact"
              onClick={handleScrollToContact}
              className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 font-medium transition-colors text-xs md:text-sm cursor-pointer w-fit"
            >
              <Mail className="h-4 w-4" />
              <span>{tMain(locale, "lets_work")}</span>
            </Link>

            <Link
              href="#about"
              onClick={handleScrollToAbout}
              className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 font-medium hover:bg-neutral-50 active:bg-neutral-50 transition-colors dark:border-white/10 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:active:bg-neutral-800 text-xs md:text-sm cursor-pointer w-fit"
            >
              <span>{tMain(locale, "more_about_me")}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
          </motion.div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <TooltipProvider>
              <div className="flex items-center gap-3 mt-4">
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
                        whileTap={{ scale: 1.05 }}
                        transition={{
                          duration: 0.35,
                          ease: "easeOut" as const,
                          delay: 0.6 + index * 0.06,
                        }}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 dark:border-white/10 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-800"
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

        </div>

        {/* Right Column: Photo with Grayscale Filter & Fade-out overlay */}
        <div className="flex justify-center items-end relative min-h-0 lg:min-h-[580px] w-full order-2 lg:col-span-5 z-20 pointer-events-none mt-2 lg:mt-0">
          <motion.div
            variants={fadeUpVariants}
            whileHover={{ scale: 1.01, transition: { duration: 0.5, ease: "easeOut" } }}
            whileTap={{ scale: 1.01, transition: { duration: 0.3, ease: "easeOut" } }}
            className="relative w-full max-w-[320px] sm:max-w-[360px] lg:w-[520px] lg:max-w-none lg:aspect-4/5 flex items-end justify-center overflow-visible lg:absolute lg:bottom-0 lg:left-1/2 lg:-translate-x-1/2 origin-bottom pointer-events-auto"
          >
            <Image
              src={heroImage}
              alt={profile?.full_name || "Fadil Bafagih"}
              priority
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className="object-contain max-h-[380px] sm:max-h-[430px] lg:max-h-[620px] w-auto pointer-events-auto select-none profile-image-grayscale"
            />
            {/* High-fidelity 13-stop easing gradient to match page background with ultra-smooth transition at both ends */}
            <div className="absolute bottom-[-2px] left-0 right-0 h-28 lg:h-36 pointer-events-none z-10 bg-[linear-gradient(to_top,#fff_0%,rgba(255,255,255,0.99)_3%,rgba(255,255,255,0.97)_8%,rgba(255,255,255,0.92)_15%,rgba(255,255,255,0.82)_25%,rgba(255,255,255,0.65)_38%,rgba(255,255,255,0.45)_52%,rgba(255,255,255,0.27)_66%,rgba(255,255,255,0.15)_78%,rgba(255,255,255,0.07)_87%,rgba(255,255,255,0.02)_94%,rgba(255,255,255,0.005)_97%,transparent_100%)] dark:bg-[linear-gradient(to_top,#0a0a0a_0%,rgba(10,10,10,0.99)_3%,rgba(10,10,10,0.97)_8%,rgba(10,10,10,0.92)_15%,rgba(10,10,10,0.82)_25%,rgba(10,10,10,0.65)_38%,rgba(10,10,10,0.45)_52%,rgba(10,10,10,0.27)_66%,rgba(10,10,10,0.15)_78%,rgba(10,10,10,0.07)_87%,rgba(10,10,10,0.02)_94%,rgba(10,10,10,0.005)_97%,transparent_100%)]" />
          </motion.div>
        </div>

      </div>

    </motion.section>
  );
}
