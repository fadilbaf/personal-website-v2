"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, FileText, Loader2 } from "lucide-react";
import { cn } from "@/src/app/lib/utils";
import { useLanguage } from "@/context/language-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function extractPdfFileName(url: string, fallback = "CV.pdf"): string {
  if (!url) return fallback;
  try {
    const cleanUrl = url.split("?")[0].split("#")[0];
    const parsed = new URL(cleanUrl, "https://dummy.local");
    const segments = parsed.pathname.split("/").filter(Boolean);
    const raw = segments[segments.length - 1];
    if (!raw) return fallback;
    const decoded = decodeURIComponent(raw);
    // Strip leading numeric timestamp prefixes like 1788874078099- or 1788874078099_
    const clean = decoded.replace(/^\d{10,}[-_]/, "");
    return clean || decoded || fallback;
  } catch {
    const raw = url.split("/").pop()?.split("?")[0]?.split("#")[0] || fallback;
    return decodeURIComponent(raw);
  }
}

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName?: string;
}

/**
 * A professional PDF Viewer Modal featuring:
 * - A glassmorphic blurred backdrop.
 * - A custom rounded square close button matching the user's updated design.
 * - Native browser PDF embedding capabilities (lightweight and high-performance).
 * - Direct external tab opening actions.
 * - Interactive loading indicator state.
 */
export function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  fileName,
}: PdfViewerModalProps) {
  const { language, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const displayFileName = fileName || extractPdfFileName(pdfUrl, "CV-Resume.pdf");

  // Detect mobile environment for inline PDF compatibility
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = typeof window !== "undefined" ? window.innerWidth < 768 : false;
      setIsMobile(isMobileUA || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent scrolling of background page when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Reset loading state when PDF url changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, pdfUrl]);

  if (!isOpen) return null;

  // Resolve absolute URL for Google Docs Viewer
  const getAbsolutePdfUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (typeof window !== "undefined") {
      return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    return url;
  };

  const absolutePdfUrl = getAbsolutePdfUrl(pdfUrl);
  const iframeSrc = isMobile
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(absolutePdfUrl)}&embedded=true`
    : `${pdfUrl}#toolbar=1`;

  return (
    <TooltipProvider>
      <div className="fixed inset-0 isolate z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Backdrop Blur */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/10 backdrop-blur-xs cursor-pointer"
        />

        {/* Premium Rounded Square Close Button (floating top-right) */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-60">
          <Tooltip>
            <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
              <button
                onClick={(e) => {
                  e.currentTarget.blur();
                  onClose();
                }}
                type="button"
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-xl sm:rounded-2xl",
                  "bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md",
                  "border border-neutral-300 dark:border-neutral-600 shadow-lg",
                  "text-neutral-950 dark:text-neutral-50",
                  "hover:bg-white/90 active:bg-white/90 dark:hover:bg-neutral-800/90 dark:active:bg-neutral-800/90 active:scale-95",
                  "transition-all duration-200 cursor-pointer outline-none group"
                )}
                aria-label={language === "id" ? "Tutup" : "Close"}
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="z-70">
              <p>{language === "id" ? "Tutup" : "Close"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Modal PDF Sheet Container */}
        <div
          className={cn(
            "relative w-full max-w-5xl h-[85vh]",
            "bg-white dark:bg-neutral-900 rounded-[28px]",
            "border border-neutral-200 dark:border-neutral-800 shadow-2xl",
            "flex flex-col overflow-hidden z-50"
          )}
        >
          {/* Custom Control Toolbar Header */}
          <div className="h-16 px-6 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
            {/* Left: PDF Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-neutral-200/50 dark:bg-neutral-800 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              </div>
              <span className="font-sans font-medium text-sm text-neutral-800 dark:text-neutral-200 truncate">
                {displayFileName}
              </span>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-3">
              {/* Open in New Tab Button */}
              <Tooltip>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.currentTarget.blur()}
                    className={cn(
                      "flex items-center justify-center p-2.5 rounded-xl border transition-all duration-200 cursor-pointer outline-none",
                      "border-neutral-200 hover:bg-neutral-100 active:bg-neutral-100 text-neutral-600",
                      "dark:border-neutral-800 dark:hover:bg-neutral-800 dark:active:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:active:text-neutral-200"
                    )}
                    aria-label={language === "id" ? "Buka di tab baru" : "Open in new tab"}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="z-70">
                  <p>{language === "id" ? "Buka di tab baru" : "Open in new tab"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Content Area */}
          <div className="relative flex-1 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center overflow-hidden">
            {/* Spinner while iframe loads */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-950 z-10 transition-opacity">
                <Loader2 className="w-8 h-8 text-neutral-500 animate-spin" />
                <span className="text-xs text-neutral-500 font-medium">{t("common.pdf_viewer.loading")}</span>
              </div>
            )}

            {/* PDF Iframe (Native on Desktop, Google Docs Embed on Mobile) */}
            <iframe
              key={iframeSrc}
              src={iframeSrc}
              className="w-full h-full border-none"
              title={displayFileName}
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
