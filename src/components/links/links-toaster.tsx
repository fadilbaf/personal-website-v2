"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Toaster as SonnerToaster } from "sonner";

export function LinksToaster() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const isLinksPage = pathname?.includes("/links");

  return (
    <SonnerToaster
      position="top-right"
      duration={5000}
      closeButton
      expand={true}
      theme={resolvedTheme as "light" | "dark" | "system"}
      offset={
        isLinksPage
          ? { top: "16px", right: "16px" }
          : { top: "68px", right: "16px" }
      }
      mobileOffset={{ top: "68px", left: "16px", right: "16px" }}
      toastOptions={{
        className: "font-sans pr-10",
        classNames: {
          toast:
            "group toast dark:bg-neutral-950 dark:text-neutral-50 dark:border-neutral-800 bg-white text-neutral-950 border-neutral-200 shadow-lg border",
          description:
            "dark:text-neutral-400 text-neutral-500 text-xs mt-0 leading-tight",
          actionButton:
            "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold text-xs rounded-md px-2.5 py-1.5 transition-colors cursor-pointer",
          closeButton:
            "dark:bg-neutral-950 dark:text-neutral-400 bg-white text-neutral-500 border dark:border-neutral-800 border-neutral-200",
        },
      }}
    />
  );
}

