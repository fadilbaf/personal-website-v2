"use client";

import { useEffect, useState, FocusEvent } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/src/app/lib/utils";
import { useParams, usePathname } from "next/navigation";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Premium ScrollToTop button component.
 * - Styled exactly identical to the custom PDF close button.
 * - Positioned:
 *   - Mobile: aligned with content boundaries (right-3.5, 14px).
 *   - Desktop & Tablet: floating in the bottom-right corner (sm:right-6, 24px).
 * - Dynamically toggles visibility based on scroll height.
 * - Lightweight fluid fade-up / fade-down Tailwind transition animations.
 * - Fully localized Tooltip support (English / Bahasa Indonesia).
 */
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const [locale, setLocale] = useState<MainLocale>("en");

  useEffect(() => {
    if (params?.locale === "id" || pathname?.startsWith("/id")) {
      setLocale("id");
    } else if (pathname?.startsWith("/dashboard") || pathname === "/login") {
      const stored = localStorage.getItem("admin-language");
      if (stored === "id" || stored === "en") {
        setLocale(stored);
      }
    }
  }, [params?.locale, pathname]);

  useEffect(() => {
    let originalScrollRestoration: ScrollRestoration | undefined;
    
    if (typeof window !== "undefined") {
      originalScrollRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      const hasTarget = !!sessionStorage.getItem("scroll-target") || (!!window.location.hash && window.location.hash !== "#");
      if (!hasTarget) {
        window.scrollTo(0, 0);
      }
    }

    const toggleVisibility = () => {
      // Use setTimeout to ensure Radix UI has finished updating DOM attributes
      setTimeout(() => {
        const isModalOpen = 
          document.body.style.pointerEvents === "none" || 
          document.body.hasAttribute("data-scroll-locked") ||
          document.body.style.overflow === "hidden" ||
          document.documentElement.style.overflow === "hidden" ||
          !!document.querySelector('[data-nav-menu="open"]') ||
          !!document.querySelector('[data-state="open"]');

        // Show button if scrolled down past 300px and no modals/sidebars are open
        if (window.scrollY > 300 && !isModalOpen) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }, 0);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    
    // Watch for dialog/sheet mounting/unmounting and attribute locks on the document body
    const observer = new MutationObserver(toggleVisibility);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    // Initial check
    toggleVisibility();

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      observer.disconnect();
      if (typeof window !== "undefined" && originalScrollRestoration) {
        window.history.scrollRestoration = originalScrollRestoration;
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild onFocus={(e: FocusEvent<HTMLButtonElement>) => e.preventDefault()}>
          <button
            onClick={scrollToTop}
            type="button"
            className={cn(
              "fixed bottom-6 right-3.5 sm:right-6 z-40 flex items-center justify-center w-12 h-12 rounded-xl sm:rounded-2xl",
              "bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md",
              "border border-neutral-300 dark:border-neutral-600 shadow-lg",
              "text-neutral-950 dark:text-neutral-50",
              "hover:bg-white/90 active:bg-white/90 dark:hover:bg-neutral-800/90 dark:active:bg-neutral-800/90 active:scale-95",
              "transition-all duration-300 ease-out cursor-pointer outline-none group",
              isVisible 
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
                : "opacity-0 translate-y-4 scale-90 pointer-events-none"
            )}
          >
            <ChevronUp className="w-5 h-5 stroke-[2.5] transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{tMain(locale, "scroll_to_top")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
