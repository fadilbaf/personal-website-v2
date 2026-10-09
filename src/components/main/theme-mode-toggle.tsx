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
}

export function ThemeModeToggle({ locale, className }: ThemeModeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-1.5 h-9 w-[110px] animate-pulse", className)} />
    );
  }

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

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("flex items-center gap-1 p-1 rounded-lg border border-neutral-200 dark:border-white/10 bg-transparent", className)}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.value;
          return (
            <Tooltip key={opt.value}>
              <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                <button
                  type="button"
                  onClick={(e) => {
                    setThemeWithTransition(opt.value, resolvedTheme, setTheme);
                    e.currentTarget.blur();
                  }}
                  className={`relative flex h-7 flex-1 min-w-[28px] items-center justify-center rounded-md transition-all duration-200 cursor-pointer ${
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
