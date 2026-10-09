"use client";

import { useLanguage } from "@/context/language-context";
import { ThemeModeToggle } from "@/src/components/main/theme-mode-toggle";
import type { MainLocale } from "@/src/lib/main-translations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardSwitchesProps {
  className?: string;
}

export function DashboardSwitches({ className }: DashboardSwitchesProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center justify-between gap-1.5 w-full ${className || ""}`}>
      <ThemeModeToggle locale={language as MainLocale} className="flex-3 h-9" />

      {/* Language Toggle Switch [ EN | ID ] with Tooltip */}
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center p-1 rounded-lg border border-neutral-200 dark:border-white/10 bg-transparent h-9 flex-2 gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (language !== "en") setLanguage("en");
                }}
                className={`flex-1 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-200 select-none ${
                  language === "en"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs cursor-default"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                }`}
                aria-label="English"
              >
                EN
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>English</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (language !== "id") setLanguage("id");
                }}
                className={`flex-1 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-200 select-none ${
                  language === "id"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs cursor-default"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                }`}
                aria-label="Bahasa Indonesia"
              >
                ID
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>Bahasa Indonesia</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
