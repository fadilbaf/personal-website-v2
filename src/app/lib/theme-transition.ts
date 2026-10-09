import { flushSync } from "react-dom";

/**
 * Executes a circular reveal theme toggle transition using the View Transitions API.
 * Expands from the bottom-left corner (0% 100%) smoothly without any ending delay.
 * Falls back to standard instant theme change if not supported or motion is reduced.
 */
export function setThemeWithTransition(
  targetTheme: string,
  resolvedTheme: string | undefined,
  setTheme: (theme: string) => void
) {
  let newResolvedTheme: string;
  if (targetTheme === "system") {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    newResolvedTheme = prefersDark ? "dark" : "light";
  } else {
    newResolvedTheme = targetTheme;
  }

  // If actual visual theme does not change, just apply setting directly
  if (newResolvedTheme === resolvedTheme) {
    setTheme(targetTheme);
    return;
  }

  const isDark = newResolvedTheme === "dark";

  // 1. Fallback for browsers that don't support View Transitions or if reduced motion is preferred
  if (
    typeof document === "undefined" ||
    !document.startViewTransition ||
    (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  ) {
    setTheme(targetTheme);
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
      document.documentElement.style.colorScheme = newResolvedTheme;
      setTheme(targetTheme);
    });
  });

  // 3. Smoothly animate the circular clip path expanding from bottom-left corner (0% 100%)
  transition.ready.then(() => {
    const endRadius = Math.hypot(
      typeof window !== "undefined" ? window.innerWidth : 1920,
      typeof window !== "undefined" ? window.innerHeight : 1080
    ) * 1.05;

    document.documentElement.animate(
      {
        clipPath: [
          "circle(0px at 0% 100%)",
          `circle(${endRadius}px at 0% 100%)`,
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

/**
 * Toggles between light and dark theme with circular transition from bottom-left corner (0% 100%).
 */
export function toggleThemeWithTransition(
  resolvedTheme: string | undefined,
  setTheme: (theme: string) => void,
  _e?: React.MouseEvent | React.TouchEvent | MouseEvent
) {
  const newTheme = resolvedTheme === "dark" ? "light" : "dark";
  setThemeWithTransition(newTheme, resolvedTheme, setTheme);
}
