"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  X,
  ExternalLink,
  Download,
  FileText,
  Loader2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/src/app/lib/utils";
import { useLanguage } from "@/context/language-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useScrollLock } from "@/src/app/lib/use-scroll-lock";
import { trackEvent } from "@/src/lib/track-event";

export function extractPdfFileName(
  url: string,
  fallback = "Hasan-Fadlullah-CV.pdf"
): string {
  if (!url) return fallback;
  try {
    const cleanUrl = url.split("?")[0].split("#")[0];
    const parsed = new URL(cleanUrl, "https://dummy.local");
    const segments = parsed.pathname.split("/").filter(Boolean);
    const raw = segments[segments.length - 1];
    if (!raw || raw.toLowerCase() === "cv" || raw.toLowerCase() === "cv.pdf") {
      return fallback;
    }
    const decoded = decodeURIComponent(raw);
    const clean = decoded.replace(/^\d{10,}[-_]/, "");
    return clean || decoded || fallback;
  } catch {
    const raw = url.split("/").pop()?.split("?")[0]?.split("#")[0] || fallback;
    if (raw.toLowerCase() === "cv" || raw.toLowerCase() === "cv.pdf") {
      return fallback;
    }
    return decodeURIComponent(raw);
  }
}

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName?: string;
}

// Client-side PDF.js Dynamic Loader (zero-bundle Turbopack/Next.js compatibility)
function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject("Window is undefined");
  if ((window as any).pdfjsLib) {
    return Promise.resolve((window as any).pdfjsLib);
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById("pdfjs-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(lib);
        } else {
          reject(new Error("pdfjsLib not available"));
        }
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "pdfjs-script";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(lib);
      } else {
        reject(new Error("pdfjsLib undefined after script load"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js from CDN"));
    document.head.appendChild(script);
  });
}

export function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  fileName,
}: PdfViewerModalProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const pageContainerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const renderTasksRef = useRef<Map<number, any>>(new Map());
  const pdfDocRef = useRef<any>(null);

  const rawFileName =
    fileName || extractPdfFileName(pdfUrl, "Hasan-Fadlullah-CV.pdf");
  const cleanBaseName = rawFileName.replace(/\.pdf$/i, "");
  const displayFileName = `${cleanBaseName}.pdf`;

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      trackEvent("cv_download", "pdf_modal_download_btn");
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = displayFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = displayFileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  useScrollLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && e.isTrusted) onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Render a specific page to canvas
  const renderPage = useCallback(
    async (pageNumber: number, pdf: any, scale: number) => {
      const canvas = canvasRefs.current.get(pageNumber);
      if (!canvas || !pdf) return;

      try {
        if (renderTasksRef.current.has(pageNumber)) {
          const prevTask = renderTasksRef.current.get(pageNumber);
          prevTask.cancel();
          renderTasksRef.current.delete(pageNumber);
        }

        const page = await pdf.getPage(pageNumber);
        const containerWidth = containerRef.current?.clientWidth || 800;
        const unscaledViewport = page.getViewport({ scale: 1 });

        // Calculate responsive base scale to fit container width nicely (with padding)
        const availableWidth = Math.max(containerWidth - 64, 300);
        const fitScale = availableWidth / unscaledViewport.width;
        const computedScale = fitScale * scale;

        const viewport = page.getViewport({ scale: computedScale });
        const outputScale = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        const pixelWidth = Math.floor(viewport.width * outputScale);
        const pixelHeight = Math.floor(viewport.height * outputScale);
        const cssWidth = Math.floor(viewport.width);
        const cssHeight = Math.floor(viewport.height);

        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        const transform =
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderContext = {
          canvasContext: context,
          transform: transform,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTasksRef.current.set(pageNumber, renderTask);

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error(`Error rendering page ${pageNumber}:`, err);
        }
      }
    },
    []
  );

  // Load PDF Document via PDF.js
  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);
    setCurrentPage(1);

    const loadPdf = async () => {
      try {
        const pdfjsLib = await loadPdfJs();

        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (!isMounted) return;

        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Failed to load PDF:", err);
        if (isMounted) {
          setLoadError(err?.message || "Failed to load document");
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      renderTasksRef.current.forEach((task) => task.cancel());
      renderTasksRef.current.clear();
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
    };
  }, [isOpen, pdfUrl]);

  // Re-render pages when document or zoom scale changes
  useEffect(() => {
    if (!pdfDocRef.current || numPages === 0 || isLoading) return;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      renderPage(pageNum, pdfDocRef.current, zoomScale);
    }
  }, [numPages, zoomScale, isLoading, renderPage]);

  // Handle Dynamic Page Detection during Scrolling
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || numPages <= 1) return;

    const containerRect = container.getBoundingClientRect();
    const containerTarget = containerRect.top + containerRect.height / 3;

    let closestPage = 1;
    let minDistance = Infinity;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const el = pageContainerRefs.current.get(pageNum);
      if (el) {
        const rect = el.getBoundingClientRect();
        const pageCenter = rect.top + rect.height / 2;
        const dist = Math.abs(pageCenter - containerTarget);
        if (dist < minDistance) {
          minDistance = dist;
          closestPage = pageNum;
        }
      }
    }
    setCurrentPage(closestPage);
  }, [numPages]);

  // Handle Window Resize to re-render responsive canvas
  useEffect(() => {
    if (!isOpen) return;

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (pdfDocRef.current && numPages > 0) {
          for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            renderPage(pageNum, pdfDocRef.current, zoomScale);
          }
        }
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, numPages, zoomScale, renderPage]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomScale(1);

  return (
    <TooltipProvider>
      <div className="fixed inset-0 isolate z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 overscroll-contain">
        {/* Backdrop Blur */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer touch-none animate-in fade-in duration-200"
        />

        {/* Modal PDF Sheet Container */}
        <div
          className={cn(
            "relative w-full max-w-5xl h-[90vh] sm:h-[85vh]",
            "bg-neutral-100 dark:bg-neutral-900 rounded-[24px] sm:rounded-[28px]",
            "border border-neutral-200/80 dark:border-neutral-800 shadow-2xl",
            "flex flex-col overflow-hidden z-50 animate-in zoom-in-95 duration-200"
          )}
        >
          {/* Custom Control Toolbar Header */}
          <div className="h-14 sm:h-16 px-4 sm:px-6 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
            {/* Left: PDF Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-100/80 dark:bg-neutral-800/80 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <span className="font-sans font-medium text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 truncate">
                {displayFileName}
              </span>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Download Button */}
              <Tooltip>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer outline-none focus:outline-none",
                      "border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md",
                      "hover:bg-neutral-100/80 active:bg-neutral-100/80 dark:hover:bg-neutral-800/80 dark:active:bg-neutral-800/80",
                      "text-neutral-900 dark:text-neutral-100",
                      "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                    aria-label={t("common.pdf_viewer.download")}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="z-70">
                  <p>{t("common.pdf_viewer.download")}</p>
                </TooltipContent>
              </Tooltip>

              {/* Open in New Tab Button */}
              <Tooltip>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      trackEvent("cv_download", "pdf_modal_open_tab");
                    }}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer outline-none focus:outline-none",
                      "border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md",
                      "hover:bg-neutral-100/80 active:bg-neutral-100/80 dark:hover:bg-neutral-800/80 dark:active:bg-neutral-800/80",
                      "text-neutral-900 dark:text-neutral-100"
                    )}
                    aria-label={t("common.pdf_viewer.open_tab")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="z-70">
                  <p>{t("common.pdf_viewer.open_tab")}</p>
                </TooltipContent>
              </Tooltip>

              {/* Close Button */}
              <Tooltip>
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <button
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onClose();
                    }}
                    type="button"
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer outline-none focus:outline-none",
                      "border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md",
                      "hover:bg-neutral-100/80 active:bg-neutral-100/80 dark:hover:bg-neutral-800/80 dark:active:bg-neutral-800/80",
                      "text-neutral-900 dark:text-neutral-100"
                    )}
                    aria-label={t("common.pdf_viewer.close")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="z-70">
                  <p>{t("common.pdf_viewer.close")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Content Scroll Area */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="relative flex-1 bg-neutral-100 dark:bg-neutral-950 overflow-auto overscroll-contain p-4 sm:p-6"
          >
            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-100/90 dark:bg-neutral-950/90 z-20 backdrop-blur-xs">
                <Loader2 className="w-8 h-8 text-neutral-600 dark:text-neutral-400 animate-spin" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                  {t("common.pdf_viewer.loading")}
                </span>
              </div>
            )}

            {/* Error Message */}
            {loadError && !isLoading && (
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-md my-auto gap-3">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {t("common.pdf_viewer.load_error")}
                </p>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:opacity-90 transition-opacity"
                >
                  {t("common.pdf_viewer.open_file")}
                </a>
              </div>
            )}

            {/* Rendered PDF Pages */}
            {!isLoading && !loadError && (
              <div className="flex flex-col items-center gap-6 min-w-full w-fit mx-auto pb-16">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                  <div
                    key={pageNum}
                    ref={(el) => {
                      if (el) {
                        pageContainerRefs.current.set(pageNum, el);
                      } else {
                        pageContainerRefs.current.delete(pageNum);
                      }
                    }}
                    className="relative flex flex-col items-center shadow-xl rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-white shrink-0"
                  >
                    <canvas
                      ref={(el) => {
                        if (el) {
                          canvasRefs.current.set(pageNum, el);
                        } else {
                          canvasRefs.current.delete(pageNum);
                        }
                      }}
                      className="block select-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating Bottom Control Toolbar */}
          {!isLoading && !loadError && numPages > 0 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900/90 dark:bg-neutral-800/90 backdrop-blur-md text-white rounded-full border border-white/15 dark:border-white/10 shadow-2xl shadow-black/30 select-none animate-in fade-in slide-in-from-bottom-3 duration-200">
              {/* Dynamic Page Indicator */}
              <span className="text-[11px] font-medium text-neutral-200 px-1 tabular-nums">
                {t("common.pdf_viewer.page")} {currentPage} / {numPages}
              </span>
              <div className="w-px h-3.5 bg-white/20" />

              {/* Zoom Out Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomScale <= 0.5}
                    className="p-1.5 rounded-full hover:bg-white/15 active:bg-white/25 text-neutral-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer outline-none"
                    aria-label={t("common.pdf_viewer.zoom_out")}
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="z-70">
                  <p>{t("common.pdf_viewer.zoom_out")}</p>
                </TooltipContent>
              </Tooltip>

              {/* Reset Zoom Percentage */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleZoomReset}
                    className="px-2 py-0.5 text-[11px] font-medium text-neutral-200 hover:text-white hover:bg-white/15 active:bg-white/25 rounded-full transition-colors cursor-pointer outline-none tabular-nums"
                    aria-label={t("common.pdf_viewer.reset_zoom")}
                  >
                    {Math.round(zoomScale * 100)}%
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="z-70">
                  <p>{t("common.pdf_viewer.reset_zoom")}</p>
                </TooltipContent>
              </Tooltip>

              {/* Zoom In Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomScale >= 2.5}
                    className="p-1.5 rounded-full hover:bg-white/15 active:bg-white/25 text-neutral-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer outline-none"
                    aria-label={t("common.pdf_viewer.zoom_in")}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="z-70">
                  <p>{t("common.pdf_viewer.zoom_in")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
