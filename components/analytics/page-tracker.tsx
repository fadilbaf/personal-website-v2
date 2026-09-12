"use client";

import { useEffect } from "react";

/**
 * Client component for global client utilities (such as enabling touch :active state on iOS).
 */
export function PageTracker() {
  useEffect(() => {
    // Enable CSS :active states globally on touch/iOS devices
    const handleTouchStart = () => {};
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  return null;
}

