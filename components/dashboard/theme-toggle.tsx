"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/context/language-context";

import { toggleThemeWithTransition } from "@/src/app/lib/theme-transition";

/**
 * Theme toggle button — switches between light and dark mode.
 * Uses Sun/Moon icons from Lucide with a smooth rotation animation.
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggleThemeWithTransition(resolvedTheme, setTheme, e);
    setOpen(false); // Hide tooltip on click
    e.currentTarget.blur();
  };

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-white/10 active:bg-neutral-100 dark:active:bg-white/10 cursor-pointer relative flex items-center justify-center"
          aria-label="Toggle theme"
        >
          <Moon className="h-4 w-4 text-neutral-600 dark:text-neutral-400 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Sun className="absolute h-4 w-4 text-neutral-600 dark:text-neutral-400 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{resolvedTheme === "dark" ? t("header.theme_light") : t("header.theme_dark")}</p>
      </TooltipContent>
    </Tooltip>
  );
}
