"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/src/lib/track-event";

/**
 * Invisible client component that tracks page views on mount and route change.
 * Drops into RootLayout to automatically record real-time visitor metrics.
 */
export function PageTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    // Enable CSS :active states globally on touch/iOS devices
    const handleTouchStart = () => {};
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  useEffect(() => {
    // Avoid double-tracking on the same pathname within strict mode
    if (pathname && pathname !== lastTracked.current) {
      lastTracked.current = pathname;
      trackEvent("page_view");
    }
  }, [pathname]);

  return null;
}
