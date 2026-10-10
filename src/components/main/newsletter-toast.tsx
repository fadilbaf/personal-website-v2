"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Newspaper, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { tMain, type MainLocale } from "@/src/lib/main-translations";

interface NewsletterToastProps {
  locale: MainLocale;
}

// 1-hour cooldown enabled
const ENABLE_STORAGE_COOLDOWN = true;
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export function NewsletterToast({ locale }: NewsletterToastProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasScrollTop, setHasScrollTop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Monitor scroll position to coordinate with ScrollToTop button (>300px)
    const handleScroll = () => {
      setHasScrollTop(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Cooldown check (active only when ENABLE_STORAGE_COOLDOWN is true)
    if (ENABLE_STORAGE_COOLDOWN) {
      const dismissedUntil = localStorage.getItem("newsletter_toast_dismissed_until");
      const isSubscribed = localStorage.getItem("newsletter_subscribed") === "true";
      if (isSubscribed) return;
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;
    }

    // Only show on: Home, All Projects, All Achievements, All Blogs
    const cleanPath = pathname?.replace(/\/$/, "") || "";
    const isTargetPage =
      cleanPath === `/${locale}` ||
      cleanPath === "" ||
      cleanPath === `/${locale}/projects` ||
      cleanPath === "/projects" ||
      cleanPath === `/${locale}/achievements` ||
      cleanPath === "/achievements" ||
      cleanPath === `/${locale}/blogs` ||
      cleanPath === "/blogs";

    if (!isTargetPage) return;

    // Trigger popup 3 seconds after initial page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname, locale]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (ENABLE_STORAGE_COOLDOWN && typeof window !== "undefined") {
      localStorage.setItem(
        "newsletter_toast_dismissed_until",
        String(Date.now() + COOLDOWN_MS)
      );
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
        if (typeof window !== "undefined") {
          sessionStorage.setItem("newsletter_toast_dismissed", "true");
          localStorage.setItem("newsletter_subscribed", "true");
        }
        setTimeout(() => setIsVisible(false), 800);
      } else {
        toast.error(result.error || tMain(locale, "newsletter_error"));
      }
    } catch {
      toast.error(tMain(locale, "newsletter_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={`fixed right-3.5 sm:right-6 z-50 w-[calc(100%-1.75rem)] sm:w-auto max-w-sm sm:max-w-[380px] transition-[bottom] duration-300 ease-out ${
            hasScrollTop
              ? "bottom-[82px] sm:bottom-[88px]"
              : "bottom-3.5 sm:bottom-6"
          }`}
        >
          <div className="relative rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl p-4 sm:p-5 shadow-md">
            {/* Close Button X (Clean rounded-md instead of circle) */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-3.5 right-3.5 rounded-md p-1.5 border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Header: Title with Newspaper Icon */}
            <div className="flex items-center gap-2 mb-1.5 pr-7">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100 dark:bg-input/40 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10 shrink-0">
                <Newspaper className="h-3.5 w-3.5" />
              </span>
              <h4 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
                {tMain(locale, "newsletter")}
              </h4>
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3.5 pr-2">
              {tMain(locale, "newsletter_desc")}
            </p>

            {/* Subscribe Form (Field background matched to message form inputs) */}
            <form onSubmit={handleSubscribe} className="w-full" noValidate>
              <div className="flex h-10 items-center justify-between border border-input dark:border-white/10 rounded-lg p-1 bg-neutral-100/60 dark:bg-input/30 w-full focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40 transition-all">
                <div className="flex h-full items-center gap-2 pl-2 flex-1 min-w-0">
                  <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={tMain(locale, "enter_email")}
                    className="w-full h-full bg-transparent border-none p-0 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white dark:placeholder:text-neutral-500 transition-all"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-full rounded-md bg-neutral-900 px-3.5 text-xs font-semibold text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 whitespace-nowrap cursor-pointer transition-colors duration-200 inline-flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{tMain(locale, "subscribing")}</span>
                    </>
                  ) : (
                    <span>{tMain(locale, "subscribe")}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
