"use client";

import { useEffect } from "react";

let lockCount = 0;
let originalBodyOverflow = "";
let originalHtmlOverflow = "";
let originalBodyPaddingRight = "";

export function lockScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (lockCount === 0) {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;

    // Set CSS custom property for fixed headers and other elements
    document.documentElement.style.setProperty(
      "--removed-body-scroll-bar-size",
      `${scrollBarWidth}px`
    );

    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("overflow-hidden");
    document.body.setAttribute("data-scroll-locked", "true");
  }

  lockCount++;
}

export function unlockScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
    document.documentElement.style.removeProperty("--removed-body-scroll-bar-size");
    document.body.classList.remove("overflow-hidden");
    document.body.removeAttribute("data-scroll-locked");
  }
}

export function forceUnlockScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  lockCount = 0;
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  document.body.style.paddingRight = "";
  document.documentElement.style.removeProperty("--removed-body-scroll-bar-size");
  document.body.classList.remove("overflow-hidden");
  document.body.removeAttribute("data-scroll-locked");
}

export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (lock) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [lock]);
}
