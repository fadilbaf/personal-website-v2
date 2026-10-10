"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { tMain, type MainLocale } from "@/src/lib/main-translations";
import { setThemeWithTransition } from "@/src/app/lib/theme-transition";

import { cn } from "@/lib/utils";

interface ThemeModeToggleProps {
  locale: MainLocale;
  className?: string;
  initialTheme?: string;
}

export function ThemeModeToggle({ locale, className, initialTheme = "system" }: ThemeModeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const active = theme || localStorage.getItem("theme");
    if (active) {
      document.cookie = `theme=${active}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.dataset.themeMode = active;
    }
  }, [theme]);

  const options = [
    {
      value: "system",
      label: tMain(locale, "theme_system"),
      icon: Laptop,
    },
    {
      value: "light",
      label: tMain(locale, "theme_light"),
      icon: Sun,
    },
    {
      value: "dark",
      label: tMain(locale, "theme_dark"),
      icon: Moon,
    },
  ];

  // Langsung gunakan theme dari context atau storage browser jika sudah di client agar tidak flicker ke 'system' saat mount/buka dropdown
  const activeTheme =
    (theme && theme !== "")
      ? theme
      : typeof window !== "undefined"
      ? (localStorage.getItem("theme") || document.documentElement.dataset.themeMode || initialTheme)
      : (mounted ? (theme || initialTheme) : initialTheme);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        suppressHydrationWarning
        className={cn("flex items-center gap-1 p-1 rounded-lg border border-neutral-200 dark:border-white/10 bg-transparent", className)}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeTheme === opt.value;
          return (
            <Tooltip key={opt.value}>
              <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                <button
                  type="button"
                  data-theme-opt={opt.value}
                  suppressHydrationWarning
                  onClick={(e) => {
                    document.cookie = `theme=${opt.value}; path=/; max-age=31536000; SameSite=Lax`;
                    document.documentElement.dataset.themeMode = opt.value;
                    setThemeWithTransition(opt.value, resolvedTheme, setTheme);
                    e.currentTarget.blur();
                  }}
                  className={`relative flex h-full min-h-[28px] flex-1 min-w-[28px] items-center justify-center rounded-md transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                  aria-label={opt.label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p>{opt.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
