import { flushSync } from "react-dom";

/**
 * Executes a circular reveal theme toggle transition using the View Transitions API.
 * Expands from the top-right corner (100% 0%) smoothly without any ending delay.
 * Falls back to standard instant theme change if not supported or motion is reduced.
 */
export function toggleThemeWithTransition(
  resolvedTheme: string | undefined,
  setTheme: (theme: string) => void,
  _e?: React.MouseEvent | React.TouchEvent | MouseEvent
) {
  const newTheme = resolvedTheme === "dark" ? "light" : "dark";
  const isDark = newTheme === "dark";

  // 1. Fallback for browsers that don't support View Transitions or if reduced motion is preferred
  if (
    typeof document === "undefined" ||
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    setTheme(newTheme);
    return;
  }

  // 2. Start the view transition and synchronously apply the theme
  const transition = document.startViewTransition(() => {
    flushSync(() => {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      document.documentElement.style.colorScheme = newTheme;
      setTheme(newTheme);
    });
  });

  // 3. Smoothly animate the circular clip path expanding from top-right corner (100% 0%)
  transition.ready.then(() => {
    const endRadius = Math.hypot(
      typeof window !== "undefined" ? window.innerWidth : 1920,
      typeof window !== "undefined" ? window.innerHeight : 1080
    );

    document.documentElement.animate(
      {
        clipPath: [
          "circle(0px at 100% 0%)",
          `circle(${endRadius}px at 100% 0%)`,
        ],
      },
      {
        duration: 250,
        easing: "linear",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  });
}
