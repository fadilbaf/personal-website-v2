"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mail, MapPin, ArrowUpRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import type { Contact, About } from "@/src/types/database";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import logoBlack from "@/src/assets/images/fadilbaf-black.svg";
import logoWhite from "@/src/assets/images/fadilbaf-white.svg";

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

// Ensure the icons match the format from links-profile.tsx
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

interface MainFooterProps {
  about: About | null;
  contact: Contact | null;
  locale: MainLocale;
}

const footerVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
    },
  },
};

export function MainFooter({ about, contact, locale }: MainFooterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const bioText = locale === "id" ? about?.bio_id : about?.bio_en;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const targetId = href.split("#")[1];
    if (!targetId) return;

    if (pathname === `/${locale}` || pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      e.preventDefault();
      sessionStorage.setItem("scroll-target", targetId);
      sessionStorage.setItem(`scroll_to_${targetId}`, "true");
      router.push(`/${locale}`, { scroll: false });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error(tMain(locale, "newsletter_required"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error(tMain(locale, "newsletter_error"));
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          locale,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || tMain(locale, "newsletter_success"));
        setEmail("");
      } else {
        toast.error(result.error || tMain(locale, "newsletter_error"));
      }
    } catch {
      toast.error(tMain(locale, "newsletter_error"));
    } finally {
      setLoading(false);
    }
  };
  
  const socialLinks = [
    { url: contact?.linkedin_url, icon: LinkedInIcon, label: "LinkedIn" },
    { url: contact?.github_url, icon: GitHubIcon, label: "GitHub" },
    { url: contact?.instagram_url, icon: InstagramIcon, label: "Instagram" },
    { url: contact?.tiktok_url, icon: TikTokIcon, label: "TikTok" },
  ].filter((link) => link.url);

  const navLinks = [
    { href: `/${locale}#about`, label: tMain(locale, "nav_about") },
    { href: `/${locale}#experiences`, label: tMain(locale, "nav_experiences") },
    { href: `/${locale}#projects`, label: tMain(locale, "nav_projects") },
    { href: `/${locale}#achievements`, label: tMain(locale, "nav_achievements") },
    { href: `/${locale}#blogs`, label: tMain(locale, "nav_blogs") },
    { href: `/${locale}#contact`, label: tMain(locale, "nav_contact") },
  ];

  return (
    <footer className="w-full border-t border-neutral-200/60 dark:border-white/10 bg-white dark:bg-neutral-950 mt-4 md:mt-6 overflow-hidden">
      <div className="w-full px-3.5 sm:px-12 md:px-24 lg:px-36 pt-6 pb-6 sm:pt-8 sm:pb-8">
        <div className="w-full max-w-[1440px] mx-auto">
        <div className="flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row lg:justify-between gap-10 lg:gap-0">
          
          {/* Col 1: Brand & Desc */}
          <div className="flex flex-col gap-6 w-full lg:max-w-[320px]">
            <Link
              href={`/${locale}`}
              onClick={(e) => {
                if (pathname === `/${locale}` || pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="inline-block"
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
            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-sm">
              {bioText || "Transforming ideas into creative digital solutions that inspire and engage, with a focus on usability, innovation, and human-centered design."}
            </p>
            {socialLinks.length > 0 && (
              <TooltipProvider>
                <div className="flex items-center gap-3">
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
                            delay: 0.2 + index * 0.06,
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
          </div>

          {/* Col 2: Navigate */}
          <div className="flex flex-col gap-4 w-full lg:max-w-[180px]">
            <h3 className="text-xs font-normal uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {tMain(locale, "navigate")}
            </h3>
            <ul className="grid grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-2 w-full lg:max-w-[200px]">
              {navLinks.map((link) => (
                <li key={link.href} className="w-full">
                  <Link 
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="group flex items-center justify-between w-full text-sm text-neutral-600 hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white transition-all px-3 py-2 border border-transparent rounded-lg hover:border-neutral-200 active:border-neutral-200 dark:hover:border-white/10 dark:active:border-white/10"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-0.5 group-active:-translate-y-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Get in Touch */}
          <div className="flex flex-col gap-4 w-full lg:max-w-[220px]">
            <h3 className="text-xs font-normal uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {tMain(locale, "get_in_touch")}
            </h3>
            <div className="flex flex-col gap-3">
              {contact?.email && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </div>
              )}
              {contact?.location && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{contact.location}</span>
                </div>
              )}
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 w-fit whitespace-nowrap"
                >
                  {tMain(locale, "lets_work")}
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 4: Newsletter */}
          <div className="flex flex-col gap-4 w-full lg:max-w-[320px]">
            <h3 className="text-xs font-normal uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {tMain(locale, "newsletter")}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {tMain(locale, "newsletter_desc")}
            </p>
            <form className="mt-2 w-full" onSubmit={handleSubscribe} noValidate>
              <div className="flex h-11 items-center justify-between border border-neutral-200 dark:border-white/10 rounded-lg p-1 bg-transparent w-full focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-all">
                <div className="flex h-full items-center gap-2.5 pl-2.5 flex-1 min-w-0">
                  <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={tMain(locale, "enter_email")}
                    className="w-full h-full bg-transparent border-none p-0 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white dark:placeholder:text-neutral-500 transition-all"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="h-full rounded-md bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 whitespace-nowrap cursor-pointer transition-colors duration-200 inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{tMain(locale, "subscribing")}</span>
                    </>
                  ) : (
                    <span>{tMain(locale, "subscribe")}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
      </div>

      {/* Bottom row - full width divider */}
      <div className="w-full border-t border-neutral-200/60 dark:border-white/10" />
      <motion.div
        className="w-full px-3.5 sm:px-12 md:px-24 lg:px-36 py-3.5 sm:py-4"
        variants={footerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="w-full max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center sm:text-left">
            © {new Date().getFullYear()} Fadil Bafagih. {tMain(locale, "all_rights")}
          </p>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 text-center sm:text-right">
            {tMain(locale, "build_with")}{" "}
            <a
              href="https://bafdev.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block align-baseline relative font-bold text-neutral-900 dark:text-white transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"
            >
              Bafdev
            </a>
          </span>
        </div>
      </motion.div>
    </footer>
  );
}
